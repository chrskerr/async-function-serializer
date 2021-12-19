
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

const testInput = [ 1000, 500, 100, 200, 15, 30, 2000, 1000, 500, 50, 50, 25 ];
const total = testInput.reduce<number>(( acc, curr ) => acc + curr, 0 );
jest.setTimeout( total + 2000 );

test( "sync", async () => {
	const serialisedSyncTestFunc = serializer( syncTestFunc );

	const result: ( number| undefined )[] = [];

	for ( let i = 0; i < testInput.length; i ++ ) {
		// @ts-ignore
		serialisedSyncTestFunc( testInput[ i ]).then(( res: { data?: number }) => result.push( res.data ));
	}

	while( result.length !== testInput.length ) {
		await new Promise( resolve => setTimeout( resolve, 50 ));
	}

	expect( result ).toStrictEqual([ ...testInput ]);
});

test( "async", async () => {
	const serialisedAsyncTextFunc = serializer( asyncTestFunc );

	const result: ( Promise<number> | undefined )[] = [];

	for ( let i = 0; i < testInput.length; i ++ ) {
		// @ts-ignore
		serialisedAsyncTextFunc( testInput[ i ]).then(( res: { data?: Promise<number> }) => result.push( res.data ));
	}

	while( result.length !== testInput.length ) {
		await new Promise( resolve => setTimeout( resolve, 5 ));
	}

	expect( result ).toStrictEqual([ ...testInput ]);
});

test( "async sorted", async () => {
	const asyncTestFunc = async ({ wait }: { wait: number }): Promise<number> => {
		return await new Promise( resolve => setTimeout(() => resolve( wait ), wait ));
	};
	const serialisedAsyncTextFunc = serializer( asyncTestFunc, { sortBy: { key: "wait" }, delay: 500 });

	const result: ( Promise<number> | undefined )[] = [];

	for ( let i = 0; i < testInput.length; i ++ ) {
		// @ts-ignore
		serialisedAsyncTextFunc({ wait: testInput[ i ] }).then(( res: { data?: Promise<number> }) => result.push( res.data ));
	}

	while( result.length !== testInput.length ) {
		await new Promise( resolve => setTimeout( resolve, 5 ));
	}

	expect( result ).toStrictEqual([ 15, 25, 30, 50, 50, 100, 200, 500, 500, 1000, 1000, 2000 ]);
});
