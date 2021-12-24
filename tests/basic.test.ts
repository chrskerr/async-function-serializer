import serializer from '../dist/index.js';

const syncTestFunc = (numLoops: number): number => {
	let result = 0;
	for (let i = 0; i < numLoops; i++) {
		result += 1;
	}
	return result;
};

const asyncTestFunc = async (wait: number): Promise<number> => {
	return await new Promise(resolve => setTimeout(() => resolve(wait), wait));
};

jest.setTimeout(20_000);

test('sync', async () => {
	const testInput = [100, 50, 10, 20, 15, 30, 200, 100, 500, 50, 50, 25];

	const serialisedSyncTestFunc = serializer(syncTestFunc);

	const result: (number | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < testInput.length; i++) {
		promises.push(
			new Promise(resolve => {
				serialisedSyncTestFunc(testInput[i]).then(
					(res: { data?: number }) => {
						result.push(res.data);
						resolve(true);
					},
				);
			}),
		);
	}

	await Promise.all(promises);

	expect(result).toStrictEqual([...testInput]);
});

test('async', async () => {
	const testInput = [100, 50, 10, 20, 15, 30, 200, 100, 500, 50, 50, 25];

	const serialisedAsyncTextFunc = serializer(asyncTestFunc);

	const result: (Promise<number> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < testInput.length; i++) {
		promises.push(
			new Promise(resolve => {
				serialisedAsyncTextFunc(testInput[i]).then(
					(res: { data?: Promise<number> }) => {
						result.push(res.data);
						resolve(true);
					},
				);
			}),
		);
	}

	await Promise.all(promises);

	expect(result).toStrictEqual([...testInput]);
});
