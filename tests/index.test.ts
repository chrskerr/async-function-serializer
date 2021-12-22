
import serializer from "../src";

const syncTestFunc = ( numLoops: number ): number => {
	let result = 0;
	for ( let i = 0; i < numLoops; i ++ ) {
		result += 1;
	}
	return result;
};


const asyncTestFunc = async ( wait: number ): Promise<number> => {
	return await new Promise( resolve => setTimeout(() => resolve( wait ), wait ));
};

jest.setTimeout( 20_000 );

test( "sync", async () => {
	const testInput = [ 100, 50, 10, 20, 15, 30, 200, 100, 500, 50, 50, 25 ];

	const serialisedSyncTestFunc = serializer( syncTestFunc );

	const result: ( number | undefined )[] = [];
	const promises: Promise<boolean>[] = [];

	for ( let i = 0; i < testInput.length; i ++ ) {
		promises.push(
			new Promise( resolve => {
				serialisedSyncTestFunc( testInput[ i ])
					.then(( res: { data?: number }) => {
						result.push( res.data );
						resolve( true );
					});
			}),
		);
	}

	await Promise.all( promises );

	expect( result ).toStrictEqual([ ...testInput ]);
});

test( "async", async () => {
	const testInput = [ 100, 50, 10, 20, 15, 30, 200, 100, 500, 50, 50, 25 ];

	const serialisedAsyncTextFunc = serializer( asyncTestFunc );

	const result: ( Promise<number> | undefined )[] = [];
	const promises: Promise<boolean>[] = [];

	for ( let i = 0; i < testInput.length; i ++ ) {
		promises.push(
			new Promise( resolve => {
				serialisedAsyncTextFunc( testInput[ i ])
					.then(( res: { data?: Promise<number> }) => {
						result.push( res.data );
						resolve( true );
					});
			}),
		);
	}

	await Promise.all( promises );

	expect( result ).toStrictEqual([ ...testInput ]);
});

test( "async sorted", async () => {
	const testInput = [ 100, 50, 10, 20, 15, 30, 200, 100, 500, 50, 50, 25 ];

	const asyncTestFunc = async ({ wait }: { wait: number }): Promise<number> => {
		return await new Promise( resolve => setTimeout(() => resolve( wait ), wait ));
	};
	
	const testFunc = serializer( asyncTestFunc, { sortBy: { key: "wait" }, delay: 500 });

	const result: ( Promise<number> | undefined )[] = [];
	const promises: Promise<boolean>[] = [];

	for ( let i = 0; i < testInput.length; i ++ ) {
		promises.push(
			new Promise( resolve => {
				testFunc({ wait: testInput[ i ] })
					.then(( res: { data?: Promise<number> }) => {
						result.push( res.data );
						resolve( true );
					});
			}),
		);
	}

	await Promise.all( promises );

	expect( result ).toStrictEqual( testInput.sort(( a, b ) => a - b ));
});

test( "batching", async () => {
	const batchingTest: { delay: number, data: number[] }[] = [
		{ delay: 50, data: [ 1 ]},
		{ delay: 150, data: [ 2 ]},
		{ delay: 540, data: [ 3 ]},
		{ delay: 1001, data: [ 4 ]},
		{ delay: 200, data: [ 5 ]},
	];
	
	const batchingResult = [[ 1, 2, 3 ], [ 4, 5 ]];

	const testFunc = serializer( 
		async ( data: number[]): Promise<number[]> => {
			return await new Promise( resolve => setTimeout(() => resolve( data ), 20 ));
		}, 
		{
			batch: {
				debounceInterval: 900,
				batchTransformer: ( batch, data ) => {
					return batch ? [ ...batch, ...data ] : data;
				},
			},
		},
	);

	const result: ( Promise<number[]> | undefined )[] = [];
	const promises: Promise<boolean>[] = [];

	for ( let i = 0; i < batchingTest.length; i ++ ) {
		const current = batchingTest[ i ];

		await new Promise( resolve => {
			setTimeout(() => {
				resolve( true );
				promises.push(
					new Promise( resolve2 => {
						testFunc( current.data )
							.then(( res: { data?: Promise<number[]> }) => {
								if ( res.data ) result.push( res.data ); 
								resolve2( true );
							});
					}),
				);
			}, current.delay );
		});
	}

	await Promise.all( promises );

	expect( result ).toStrictEqual(  batchingResult );
});

test( "batching 2", async () => {
	const batchingTest: { delay: number, data: number[] }[] = [
		{ delay: 50, data: [ 1 ]},
		{ delay: 150, data: [ 2 ]},
		{ delay: 540, data: [ 3 ]},
		{ delay: 1001, data: [ 4 ]},
		{ delay: 200, data: [ 5 ]},
	];
	
	const batchingResult = [[ 1, 2 ], [ 3 ], [ 4, 5 ]];

	const testFunc = serializer( 
		async ( data: number[]): Promise<number[]> => {
			return await new Promise( resolve => setTimeout(() => resolve( data ), 20 ));
		}, 
		{
			batch: {
				debounceInterval: 500,
				batchTransformer: ( batch, data ) => {
					return batch ? [ ...batch, ...data ] : data;
				},
			},
		},
	);

	const result: ( Promise<number[]> | undefined )[] = [];
	const promises: Promise<boolean>[] = [];

	for ( let i = 0; i < batchingTest.length; i ++ ) {
		const current = batchingTest[ i ];

		await new Promise( resolve => {
			setTimeout(() => {
				resolve( true );
				promises.push(
					new Promise( resolve2 => {
						testFunc( current.data )
							.then(( res: { data?: Promise<number[]> }) => {
								if ( res.data ) result.push( res.data ); 
								resolve2( true );
							});
					}),
				);
			}, current.delay );
		});
	}

	await Promise.all( promises );

	expect( result ).toStrictEqual( batchingResult );
});

test( "batching 3", async () => {
	const batchingTest: { delay: number, data: number[] }[] = [
		{ delay: 50, data: [ 1 ]},
		{ delay: 150, data: [ 2 ]},
		{ delay: 540, data: [ 3 ]},
		{ delay: 1001, data: [ 4 ]},
		{ delay: 200, data: [ 5 ]},
	];
	
	const batchingResult = [[ 1, 2 , 3, 4, 5 ]];

	const testFunc = serializer( 
		async ( data: number[]): Promise<number[]> => {
			return await new Promise( resolve => setTimeout(() => resolve( data ), 20 ));
		}, 
		{
			batch: {
				debounceInterval: 1500,
				batchTransformer: ( batch, data ) => {
					return batch ? [ ...batch, ...data ] : data;
				},
			},
		},
	);

	const result: ( Promise<number[]> | undefined )[] = [];
	const promises: Promise<boolean>[] = [];

	for ( let i = 0; i < batchingTest.length; i ++ ) {
		const current = batchingTest[ i ];

		await new Promise( resolve => {
			setTimeout(() => {
				resolve( true );
				promises.push(
					new Promise( resolve2 => {
						testFunc( current.data )
							.then(( res: { data?: Promise<number[]> }) => {
								if ( res.data ) result.push( res.data ); 
								resolve2( true );
							});
					}),
				);
			}, current.delay );
		});
	}

	await Promise.all( promises );

	expect( result ).toStrictEqual( batchingResult );
});
