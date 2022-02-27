type Queue<Input, Return> = {
	resolve: (result: Return) => void;
	input: Input;
}[];

export type SerializeOptions<Input, Return> = {
	/**
	 * Maximum number of simultaneous executions
	 * @defaultValue 1
	 */
	concurrency?: number;

	/**
	 * How long to delay before starting initial execution
	 * @defaultValue 0
	 */
	delay?: number;

	/**
	 * Used to sort the queue at the beginning of each execution cycle
	 * @defaultValue undefined
	 */
	sortBy?: {
		/**
		 * Key of input to sort. Will only populate if input is of type object, and only supports top-level keys.
		 */
		key: keyof Input;
		/**
		 * Sort direction.
		 * @defaultValue 'asc'
		 */
		direction?: 'asc' | 'desc';
	};

	/**
	 * Batch input when adding them to the queue.
	 * @defaultValue undefined
	 */
	batch?: {
		/**
		 * How to long wait before adding the batch to the queue
		 */
		debounceInterval: number;

		/**
		 * Maximum duration before a batch will close
		 */
		maxDebounceInterval?: number;

		/**
		 * Function to combine the new queue item into the current batch
		 * @param existingBatch - the current batch
		 * @param newInput - the new item being added into the batch
		 */
		batchTransformer: (
			existingBatch: Input | undefined,
			newInput: Input,
		) => Input;
	};

	/**
	 * Function to transform the input at the beginning of each execution cycle
	 * @param input - the current value being transformed
	 * @param previousResult - the results from the previous execution, if any
	 */
	inputTransformer?: (
		input: Input,
		previousResult: Awaited<Return> | undefined,
	) => Input | Promise<Input>;
};

type InputOptions = {
	/**
	 * This will force-start a new batch. If another batch is in-progress, it will be immediately added to queue.
	 * */
	startNewBatch?: boolean;
};

type Result<R> = {
	data?: R;
	message?: unknown;
};

export default function serialize<
	Input,
	Return,
	EnrichedReturn extends Result<Return>,
>(
	func: (input: Input) => Return,
	options?: SerializeOptions<Input, Return>,
): (input: Input, inputOptions?: InputOptions) => Promise<EnrichedReturn> {
	let queue: Queue<Input, EnrichedReturn> = [];
	let previousResult: Awaited<Return> | undefined = undefined;

	let batchTimer: ReturnType<typeof setTimeout> | undefined = undefined;
	let batchTimerFunc: () => void = () => {};
	let batchStartTimestamp: number | undefined = undefined;
	let inProgressBatch: Input | undefined = undefined;
	let previousPromise: ((result: EnrichedReturn) => void) | undefined =
		undefined;

	const maxExecutions = options?.concurrency || 1;
	let currentExecutions = 0;

	let delayPromise: Promise<undefined> | undefined = undefined;

	async function start() {
		if (currentExecutions >= maxExecutions) return;

		const mightDelay = currentExecutions === 0;

		currentExecutions += 1;

		if (mightDelay && options?.delay) {
			delayPromise = new Promise(resolve =>
				setTimeout(resolve, options.delay),
			);
		}

		await delayPromise;

		run();
	}

	async function run() {
		if (options?.sortBy) {
			const key = options.sortBy.key;
			const direction = options.sortBy.direction || 'asc';
			queue = queue.sort((a, b) => {
				const valueOne =
					direction === 'asc' ? a.input[key] : b.input[key];
				const valueTwo =
					direction === 'asc' ? b.input[key] : a.input[key];

				if (
					typeof valueOne === 'number' &&
					typeof valueTwo === 'number'
				) {
					return valueOne - valueTwo;
				} else if (
					typeof valueOne === 'string' &&
					typeof valueTwo === 'string'
				) {
					return valueOne.localeCompare(valueTwo);
				} else {
					return 0;
				}
			});
		}

		const current = queue.shift();
		if (current) {
			if (options?.inputTransformer) {
				current.input = await options.inputTransformer(
					current.input,
					previousResult,
				);
			}

			try {
				const result = await func(current.input);
				current.resolve({ data: result as Return } as EnrichedReturn);
				previousResult = result;
			} catch (error) {
				current.resolve({ message: error } as EnrichedReturn);
			}
		}

		if (queue.length) await run();
		else currentExecutions -= 1;
	}

	return async function (
		input: Input,
		inputOptions?: InputOptions,
	): Promise<EnrichedReturn> {
		return await new Promise<EnrichedReturn>(resolve => {
			if (inputOptions?.startNewBatch) {
				if (batchTimer) clearTimeout(batchTimer);
				batchTimerFunc();
			}

			if (!options?.batch) {
				queue.push({ resolve, input });
				start();
			} else {
				const {
					debounceInterval,
					batchTransformer,
					maxDebounceInterval,
				} = options.batch;

				if (!batchStartTimestamp)
					batchStartTimestamp = new Date().valueOf();

				const elapsedTime = maxDebounceInterval
					? Math.max(new Date().valueOf() - batchStartTimestamp, 0)
					: 0;

				const availableTime = maxDebounceInterval
					? Math.max(maxDebounceInterval - elapsedTime, 0)
					: Infinity;

				const thisDebounceInterval = Math.min(
					debounceInterval,
					availableTime,
				);

				if (batchTimer) clearTimeout(batchTimer);
				inProgressBatch = batchTransformer(inProgressBatch, input);

				if (previousPromise) {
					previousPromise({ message: 'batched' } as EnrichedReturn);
				}
				previousPromise = resolve;

				batchTimerFunc = () => {
					queue.push({ resolve, input: inProgressBatch || input });

					inProgressBatch = undefined;
					previousPromise = undefined;
					batchStartTimestamp = undefined;
					batchTimerFunc = () => {};

					start();
				};

				batchTimer = setTimeout(batchTimerFunc, thisDebounceInterval);
			}
		});
	};
}
