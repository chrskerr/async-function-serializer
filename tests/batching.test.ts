import serializer from '../dist/index.js';

jest.setTimeout(20_000);

test('batching', async () => {
	const batchingTest: { delay: number; data: number[] }[] = [
		{ delay: 50, data: [1] },
		{ delay: 150, data: [2] },
		{ delay: 540, data: [3] },
		{ delay: 1001, data: [4] },
		{ delay: 200, data: [5] },
	];

	const batchingResult = [
		[1, 2, 3],
		[4, 5],
	];

	const testFunc = serializer(
		async (data: number[]): Promise<number[]> => {
			return await new Promise(resolve =>
				setTimeout(() => resolve(data), 20),
			);
		},
		{
			batch: {
				debounceInterval: 900,
				batchTransformer: (batch, data) => {
					return batch ? [...batch, ...data] : data;
				},
			},
		},
	);

	const result: (Promise<number[]> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < batchingTest.length; i++) {
		const current = batchingTest[i];

		await new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
				promises.push(
					new Promise(resolve2 => {
						testFunc(current.data).then(
							(res: { data?: Promise<number[]> }) => {
								if (res.data) result.push(res.data);
								resolve2(true);
							},
						);
					}),
				);
			}, current.delay);
		});
	}

	await Promise.all(promises);

	expect(result).toStrictEqual(batchingResult);
});

test('batching 2', async () => {
	const batchingTest: { delay: number; data: number[] }[] = [
		{ delay: 50, data: [1] },
		{ delay: 150, data: [2] },
		{ delay: 540, data: [3] },
		{ delay: 1001, data: [4] },
		{ delay: 200, data: [5] },
	];

	const batchingResult = [[1, 2], [3], [4, 5]];

	const testFunc = serializer(
		async (data: number[]): Promise<number[]> => {
			return await new Promise(resolve =>
				setTimeout(() => resolve(data), 20),
			);
		},
		{
			batch: {
				debounceInterval: 500,
				batchTransformer: (batch, data) => {
					return batch ? [...batch, ...data] : data;
				},
			},
		},
	);

	const result: (Promise<number[]> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < batchingTest.length; i++) {
		const current = batchingTest[i];

		await new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
				promises.push(
					new Promise(resolve2 => {
						testFunc(current.data).then(
							(res: { data?: Promise<number[]> }) => {
								if (res.data) result.push(res.data);
								resolve2(true);
							},
						);
					}),
				);
			}, current.delay);
		});
	}

	await Promise.all(promises);

	expect(result).toStrictEqual(batchingResult);
});

test('batching 3', async () => {
	const batchingTest: { delay: number; data: number[] }[] = [
		{ delay: 50, data: [1] },
		{ delay: 150, data: [2] },
		{ delay: 540, data: [3] },
		{ delay: 1001, data: [4] },
		{ delay: 200, data: [5] },
	];

	const batchingResult = [[1, 2, 3, 4, 5]];

	const testFunc = serializer(
		async (data: number[]): Promise<number[]> => {
			return await new Promise(resolve =>
				setTimeout(() => resolve(data), 20),
			);
		},
		{
			batch: {
				debounceInterval: 1500,
				batchTransformer: (batch, data) => {
					return batch ? [...batch, ...data] : data;
				},
			},
		},
	);

	const result: (Promise<number[]> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < batchingTest.length; i++) {
		const current = batchingTest[i];

		await new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
				promises.push(
					new Promise(resolve2 => {
						testFunc(current.data).then(
							(res: { data?: Promise<number[]> }) => {
								if (res.data) result.push(res.data);
								resolve2(true);
							},
						);
					}),
				);
			}, current.delay);
		});
	}

	await Promise.all(promises);

	expect(result).toStrictEqual(batchingResult);
});

test('batching 4', async () => {
	const batchingTest: { delay: number; data: number[] }[] = [
		{ delay: 50, data: [1] },
		{ delay: 150, data: [2] },
		{ delay: 540, data: [3] },
		{ delay: 1001, data: [4] },
		{ delay: 200, data: [5] },
	];

	const batchingResult = [[1, 2], [3], [4, 5]];

	const testFunc = serializer(
		async (data: number[]): Promise<number[]> => {
			return await new Promise(resolve =>
				setTimeout(() => resolve(data), 20),
			);
		},
		{
			batch: {
				debounceInterval: 500,
				maxDebounceInterval: 500,
				batchTransformer: (batch, data) => {
					return batch ? [...batch, ...data] : data;
				},
			},
		},
	);

	const result: (Promise<number[]> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < batchingTest.length; i++) {
		const current = batchingTest[i];

		await new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
				promises.push(
					new Promise(resolve2 => {
						testFunc(current.data).then(
							(res: { data?: Promise<number[]> }) => {
								if (res.data) result.push(res.data);
								resolve2(true);
							},
						);
					}),
				);
			}, current.delay);
		});
	}

	await Promise.all(promises);

	expect(result).toStrictEqual(batchingResult);
});

test('batching with break', async () => {
	const batchingTest: {
		delay: number;
		startNewBatch: boolean;
		data: number[];
	}[] = [
		{ delay: 50, startNewBatch: false, data: [1] },
		{ delay: 150, startNewBatch: false, data: [2] },
		{ delay: 150, startNewBatch: true, data: [3] },
		{ delay: 540, startNewBatch: false, data: [4] },
		{ delay: 1001, startNewBatch: false, data: [5] },
		{ delay: 200, startNewBatch: true, data: [6] },
	];

	const batchingResult = [[1, 2], [3], [4], [5], [6]];

	const testFunc = serializer(
		async (data: number[]): Promise<number[]> => {
			return await new Promise(resolve =>
				setTimeout(() => resolve(data), 20),
			);
		},
		{
			batch: {
				debounceInterval: 500,
				maxDebounceInterval: 500,
				batchTransformer: (batch, data) => {
					return batch ? [...batch, ...data] : data;
				},
			},
		},
	);

	const result: (Promise<number[]> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < batchingTest.length; i++) {
		const current = batchingTest[i];

		await new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
				promises.push(
					new Promise(resolve2 => {
						testFunc(current.data, {
							startNewBatch: current.startNewBatch,
						}).then((res: { data?: Promise<number[]> }) => {
							if (res.data) result.push(res.data);
							resolve2(true);
						});
					}),
				);
			}, current.delay);
		});
	}

	await Promise.all(promises);

	expect(result).toStrictEqual(batchingResult);
});
