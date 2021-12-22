"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function serialize(func, options) {
    let queue = [];
    let isRunning = false;
    let previousResult = undefined;
    let batchTimer = undefined;
    let inProgressBatch = undefined;
    let previousPromise = undefined;
    function run() {
        return __awaiter(this, void 0, void 0, function* () {
            const wasIsRunning = isRunning;
            isRunning = true;
            if (!wasIsRunning && (options === null || options === void 0 ? void 0 : options.delay)) {
                yield new Promise(resolve => setTimeout(resolve, options.delay));
            }
            if (options === null || options === void 0 ? void 0 : options.sortBy) {
                const key = options.sortBy.key;
                const direction = options.sortBy.direction || "asc";
                queue = queue.sort((a, b) => {
                    const valueOne = direction === "asc" ? a.input[key] : b.input[key];
                    const valueTwo = direction === "asc" ? b.input[key] : a.input[key];
                    if (typeof valueOne === "number" && typeof valueTwo === "number") {
                        return valueOne - valueTwo;
                    }
                    else if (typeof valueOne === "string" && typeof valueTwo === "string") {
                        return valueOne.localeCompare(valueTwo);
                    }
                    else {
                        return 0;
                    }
                });
            }
            const current = queue[0];
            if (options === null || options === void 0 ? void 0 : options.inputTransformer) {
                current.input = yield options.inputTransformer(current.input, previousResult);
            }
            try {
                const result = yield func(current.input);
                current.resolve({ data: result });
                previousResult = result;
            }
            catch (error) {
                current.resolve({ message: error });
            }
            queue.shift();
            if (queue.length)
                yield run();
            isRunning = false;
        });
    }
    return function (input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise(resolve => {
                if (!(options === null || options === void 0 ? void 0 : options.batch)) {
                    queue.push({ resolve, input });
                    if (!isRunning)
                        run();
                }
                else {
                    const { debounceInterval, batchTransformer } = options.batch;
                    if (batchTimer)
                        clearTimeout(batchTimer);
                    inProgressBatch = batchTransformer(inProgressBatch, input);
                    if (previousPromise)
                        previousPromise({ message: "batched" });
                    previousPromise = resolve;
                    batchTimer = setTimeout(() => {
                        queue.push({ resolve, input: inProgressBatch || input });
                        inProgressBatch = undefined;
                        previousPromise = undefined;
                        if (!isRunning)
                            run();
                    }, debounceInterval);
                }
            });
        });
    };
}
exports.default = serialize;
//# sourceMappingURL=index.js.map