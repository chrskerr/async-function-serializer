"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function serialize(func, options) {
    let queue = [];
    let isRunning = false;
    async function run() {
        const prevRunning = isRunning;
        isRunning = true;
        if (!prevRunning && options?.delay) {
            await new Promise(resolve => setTimeout(resolve, options.delay));
        }
        try {
            const result = await func(queue[0].input);
            queue[0].resolve({ data: result });
        }
        catch (error) {
            queue[0].resolve({ error });
        }
        queue.shift();
        if (queue.length)
            await run();
        isRunning = false;
    }
    return async function (input) {
        return await new Promise(resolve => {
            const item = { resolve, input };
            if (options?.sortBy) {
                const key = options.sortBy.key;
                queue = [...queue, item]
                    .sort((a, b) => options.sortBy?.direction === "desc" ?
                    Number(b.input[key]) - Number(a.input[key]) :
                    Number(a.input[key]) - Number(b.input[key]));
            }
            else {
                queue.push(item);
            }
            if (!isRunning)
                run();
        });
    };
}
exports.default = serialize;
//# sourceMappingURL=index.js.map