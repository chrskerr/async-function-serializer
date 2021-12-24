import serializer from '../dist/index.js';

jest.setTimeout(20_000);

test('simple concurrency', async () => {
	const testInput = [100, 50, 10, 20, 15, 30, 200, 100, 500, 50, 50, 25];
	const target = [50, 10, 20, 15, 100, 30, 100, 200, 50, 50, 25, 500];

	const asyncTestFunc = async (wait: number): Promise<number> => {
		return await new Promise(resolve =>
			setTimeout(() => resolve(wait), wait),
		);
	};

	const serialisedAsyncTextFunc = serializer(asyncTestFunc, {
		concurrency: 2,
	});

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

	expect(result).toStrictEqual(target);
});

test('five concurrency', async () => {
	const testInput = [100, 50, 10, 20, 15, 30, 200, 100, 500, 50, 50, 25];
	const target = [10, 15, 20, 30, 50, 100, 50, 100, 25, 50, 200, 500];

	const asyncTestFunc = async (wait: number): Promise<number> => {
		return await new Promise(resolve =>
			setTimeout(() => resolve(wait), wait),
		);
	};

	const serialisedAsyncTextFunc = serializer(asyncTestFunc, {
		concurrency: 5,
	});

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

	expect(result).toStrictEqual(target);
});
