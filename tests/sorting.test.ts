import serializer from '../src';

jest.setTimeout(20_000);

test('async sorted', async () => {
	const testInput = [100, 50, 25, 10];

	const asyncTestFunc = async ({
		wait,
	}: {
		wait: number;
	}): Promise<number> => {
		return await new Promise(resolve =>
			setTimeout(() => resolve(wait), wait),
		);
	};

	const testFunc = serializer(asyncTestFunc, {
		sortBy: { key: 'wait' },
		delay: 500,
	});

	const result: (Promise<number> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < testInput.length; i++) {
		promises.push(
			new Promise(resolve => {
				testFunc({ wait: testInput[i] }).then(
					(res: { data?: Promise<number> }) => {
						result.push(res.data);
						resolve(true);
					},
				);
			}),
		);
	}

	await Promise.all(promises);

	expect(result).toStrictEqual([10, 25, 50, 100]);
});

test('async sorted 2', async () => {
	const testInput = [100, 50, 25, 10];

	const asyncTestFunc = async ({
		wait,
	}: {
		wait: number;
	}): Promise<number> => {
		return await new Promise(resolve =>
			setTimeout(() => resolve(wait), wait),
		);
	};

	const testFunc = serializer(asyncTestFunc, {
		sortBy: { key: 'wait', direction: 'asc' },
		delay: 500,
	});

	const result: (Promise<number> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < testInput.length; i++) {
		promises.push(
			new Promise(resolve => {
				testFunc({ wait: testInput[i] }).then(
					(res: { data?: Promise<number> }) => {
						result.push(res.data);
						resolve(true);
					},
				);
			}),
		);
	}

	await Promise.all(promises);

	expect(result).toStrictEqual([10, 25, 50, 100]);
});

test('async sorted 3', async () => {
	const testInput = [100, 50, 25, 10];

	const asyncTestFunc = async ({
		wait,
	}: {
		wait: number;
	}): Promise<number> => {
		return await new Promise(resolve =>
			setTimeout(() => resolve(wait), wait),
		);
	};

	const testFunc = serializer(asyncTestFunc, {
		sortBy: { key: 'wait', direction: 'desc' },
		delay: 500,
	});

	const result: (Promise<number> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < testInput.length; i++) {
		promises.push(
			new Promise(resolve => {
				testFunc({ wait: testInput[i] }).then(
					(res: { data?: Promise<number> }) => {
						result.push(res.data);
						resolve(true);
					},
				);
			}),
		);
	}

	await Promise.all(promises);

	expect(result).toStrictEqual([100, 50, 25, 10]);
});

test('async sorted 4', async () => {
	const testInput = [
		{ wait: 100, key: 'd' },
		{ wait: 50, key: 'c' },
		{ wait: 20, key: 'a' },
		{ wait: 10, key: 'b' },
	];

	const asyncTestFunc = async ({
		wait,
		key,
	}: {
		wait: number;
		key: string;
	}): Promise<string> => {
		return await new Promise(resolve =>
			setTimeout(() => resolve(key), wait),
		);
	};

	const testFunc = serializer(asyncTestFunc, {
		sortBy: { key: 'key' },
		delay: 500,
	});

	const result: (Promise<string> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < testInput.length; i++) {
		promises.push(
			new Promise(resolve => {
				testFunc(testInput[i]).then(
					(res: { data?: Promise<string> }) => {
						result.push(res.data);
						resolve(true);
					},
				);
			}),
		);
	}

	await Promise.all(promises);

	expect(result).toStrictEqual(['a', 'b', 'c', 'd']);
});

test('async sorted 5', async () => {
	const testInput = [100, 50, 25, 10];

	const asyncTestFunc = async ({
		wait,
	}: {
		wait: number;
		key: { something: string };
	}): Promise<number> => {
		return await new Promise(resolve =>
			setTimeout(() => resolve(wait), wait),
		);
	};

	const testFunc = serializer(asyncTestFunc, {
		sortBy: { key: 'key' },
		delay: 500,
	});

	const result: (Promise<number> | undefined)[] = [];
	const promises: Promise<boolean>[] = [];

	for (let i = 0; i < testInput.length; i++) {
		promises.push(
			new Promise(resolve => {
				testFunc({
					wait: testInput[i],
					key: { something: String(testInput[i]) },
				}).then((res: { data?: Promise<number> }) => {
					result.push(res.data);
					resolve(true);
				});
			}),
		);
	}

	await Promise.all(promises);

	expect(result).toStrictEqual(testInput);
});
