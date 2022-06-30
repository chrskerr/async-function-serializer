// src/index.ts
function serialize(func, options) {
  let queue = [];
  let previousResult = void 0;
  let batchTimer = void 0;
  let batchTimerFunc = () => {
  };
  let batchStartTimestamp = void 0;
  let inProgressBatch = void 0;
  let previousPromise = void 0;
  const maxExecutions = (options == null ? void 0 : options.concurrency) || 1;
  let currentExecutions = 0;
  let delayPromise = void 0;
  async function start() {
    if (currentExecutions >= maxExecutions)
      return;
    const mightDelay = currentExecutions === 0;
    currentExecutions += 1;
    if (mightDelay && (options == null ? void 0 : options.delay)) {
      delayPromise = new Promise((resolve) => setTimeout(resolve, options.delay));
    }
    await delayPromise;
    run();
  }
  async function run() {
    if (options == null ? void 0 : options.sortBy) {
      const key = options.sortBy.key;
      const direction = options.sortBy.direction || "asc";
      queue = queue.sort((a, b) => {
        const valueOne = direction === "asc" ? a.input[key] : b.input[key];
        const valueTwo = direction === "asc" ? b.input[key] : a.input[key];
        if (typeof valueOne === "number" && typeof valueTwo === "number") {
          return valueOne - valueTwo;
        } else if (typeof valueOne === "string" && typeof valueTwo === "string") {
          return valueOne.localeCompare(valueTwo);
        } else {
          return 0;
        }
      });
    }
    const current = queue.shift();
    if (current) {
      if (options == null ? void 0 : options.inputTransformer) {
        current.input = await options.inputTransformer(current.input, previousResult);
      }
      try {
        const result = await func(current.input);
        current.resolve({ data: result });
        previousResult = result;
      } catch (error) {
        current.resolve({ message: error });
      }
    }
    if (queue.length)
      await run();
    else
      currentExecutions -= 1;
  }
  return async function(input, inputOptions) {
    return await new Promise((resolve) => {
      if (inputOptions == null ? void 0 : inputOptions.startNewBatch) {
        if (batchTimer)
          clearTimeout(batchTimer);
        batchTimerFunc();
      }
      if (!(options == null ? void 0 : options.batch)) {
        queue.push({ resolve, input });
        start();
      } else {
        const {
          debounceInterval,
          batchTransformer,
          maxDebounceInterval
        } = options.batch;
        if (!batchStartTimestamp)
          batchStartTimestamp = new Date().valueOf();
        const elapsedTime = maxDebounceInterval ? Math.max(new Date().valueOf() - batchStartTimestamp, 0) : 0;
        const availableTime = maxDebounceInterval ? Math.max(maxDebounceInterval - elapsedTime, 0) : Infinity;
        const thisDebounceInterval = Math.min(debounceInterval, availableTime);
        if (batchTimer)
          clearTimeout(batchTimer);
        inProgressBatch = batchTransformer(inProgressBatch, input);
        if (previousPromise) {
          previousPromise({ message: "batched" });
        }
        previousPromise = resolve;
        batchTimerFunc = () => {
          queue.push({ resolve, input: inProgressBatch || input });
          inProgressBatch = void 0;
          previousPromise = void 0;
          batchStartTimestamp = void 0;
          batchTimerFunc = () => {
          };
          start();
        };
        batchTimer = setTimeout(batchTimerFunc, thisDebounceInterval);
      }
    });
  };
}
export {
  serialize as default
};
