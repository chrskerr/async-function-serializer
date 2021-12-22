
type Queue<T, Q> = {
	resolve: ( result: Q ) => void,
	input: T,
}[]

export type SerializeOptions<T, R> = {
	/**
	 * How long to delay before starting initial execution
	 * @defaultValue 0
	 */
	delay?: number,

	/**
	 * Used to sort the queue at the beginning of each execution cycle
	 * @defaultValue undefined
	 */
	sortBy?: {
		/**
		 * Key of input to sort. Will only populate if input is of type object, and only supports top-level keys.
		 */
		key: keyof T,
		/**
		 * Sort direction.
		 * @defaultValue 'asc'
		 */
		direction?: "asc" | "desc",
	},

	/**
	 * Batch input when adding them to the queue.
	 * @defaultValue undefined
	 */
	batch?: {
		/**
		 * How to long wait before adding the batch to the queue
		 */
		debounceInterval: number,

		/**
		 * Function to combine the new queue item into the current batch
		 * @param existingBatch - the current batch
		 * @param newInput - the new item being added into the batch
		 */
		batchTransformer: ( existingBatch: T | undefined,  newInput: T ) => T,
	}

	/**
	 * Function to transform the input at the beginning of each execution cycle
	 * @param input - the current value being transformed
	 * @param previousResult - the results from the previous execution, if any
	 */
	inputTransformer?: ( input: T, previousResult: Awaited<R> | undefined ) => T | Promise<T>,
}

type Result<R> = { 
	data?: R,
	message?: unknown,
}

export default function serialize<
	T, R, Q extends Result<R>
>( 
	func: ( input: T ) => R, 
	options?: SerializeOptions<T, R>, 
): 
	( input: T ) => Promise<Q> 
{

	let queue: Queue<T, Q> = [];
	let isRunning = false;
	let previousResult: Awaited<R> | undefined = undefined;
	
	let batchTimer: ReturnType<typeof setTimeout> | undefined = undefined;
	let inProgressBatch: T | undefined = undefined;
	let previousPromise: (( result: Q ) => void ) | undefined = undefined;

	async function run () {
		const wasIsRunning = isRunning;
		isRunning = true;

		if ( !wasIsRunning && options?.delay ) {
			await new Promise( resolve => setTimeout( resolve, options.delay ));
		}

		if ( options?.sortBy ) {
			const key = options.sortBy.key;
			const direction = options.sortBy.direction || "asc";
			queue = queue.sort(( a, b ) => {
				const valueOne = direction === "asc" ? a.input[ key ] : b.input[ key ];
				const valueTwo = direction === "asc" ? b.input[ key ] : a.input[ key ];

				if ( typeof valueOne === "number" && typeof valueTwo === "number" ) {
					return valueOne - valueTwo;

				} else if ( typeof valueOne === "string" && typeof valueTwo === "string" ) {
					return valueOne.localeCompare( valueTwo );

				} else {
					return 0;

				}
			});
		}

		const current = queue[ 0 ];

		if ( options?.inputTransformer ) {
			current.input = await options.inputTransformer( current.input, previousResult );
		}

		try {
			const result = await func( current.input );
			current.resolve({ data: result as R } as Q );

			previousResult = result;

		} catch ( error ) {
			current.resolve({ message: error } as Q );
			
		}
		
		queue.shift();
		
		if ( queue.length ) await run();

		isRunning = false;
	}

	return async function ( input: T ): Promise<Q> {
		return await new Promise<Q>( resolve => {

			if ( !options?.batch ) {
				queue.push({ resolve, input });
				if ( !isRunning ) run();

			} else {
				const { debounceInterval, batchTransformer } = options.batch;

				if ( batchTimer ) clearTimeout( batchTimer );
				inProgressBatch = batchTransformer( inProgressBatch, input );

				if ( previousPromise ) previousPromise({ message: "batched" } as Q );
				previousPromise = resolve;

				batchTimer = setTimeout(() => {
					queue.push({ resolve, input: inProgressBatch || input });
					
					inProgressBatch = undefined;
					previousPromise = undefined;
					
					if ( !isRunning ) run();

				}, debounceInterval );
			}
		});
	}; 
}