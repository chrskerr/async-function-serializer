
type Queue<T, Q> = {
	resolve: ( result: Q ) => void,
	input: T,
}[]

export type SerializeOptions<T, R> = {
	delay?: number,
	sortBy?: {
		key: keyof T,
		direction?: "asc" | "desc",
	},
	batch?: {
		debounceInterval: number,
		batchTransformer: ( existingBatch: T | undefined,  newInput: T ) => T,
	}
	inputTransformer?: ( input: T, previousResult: Awaited<R> | undefined ) => T | Promise<T>,
}

type Result<R> = { 
	data?: R,
	error?: unknown,
}

export default function serialize<T, R, Q extends Result<R>>( func: ( input: T ) => R, options?: SerializeOptions<T, R> ): (( input: T ) => Promise<Q> ) {
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
			queue = queue.sort(( a, b ) => options.sortBy?.direction === "desc" ? 
				Number( b.input[ key ]) - Number( a.input[ key ]) :
				Number( a.input[ key ]) - Number( b.input[ key ]),
			);
		}

		const current = queue[ 0 ];

		if ( options?.inputTransformer ) {
			current.input = await options.inputTransformer( current.input, previousResult );
		}

		try {
			const result = await func( current.input );
			current.resolve({ data: result } as unknown as Q );

			previousResult = result;

		} catch ( error ) {
			current.resolve({ error } as Q );
			
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

				if ( previousPromise ) previousPromise({ error: "batched" } as unknown as Q );
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