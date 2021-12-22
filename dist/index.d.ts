export declare type SerializeOptions<T, R> = {
    /**
     * How long to delay before starting initial execution
     * @defaultValue 0
     */
    delay?: number;
    /**
     * Used to sort the queue at the beginning of each execution cycle
     * @defaultValue undefined
     */
    sortBy?: {
        /**
         * Key of input to sort. Will only populate if input is of type object, and only supports top-level keys.
         */
        key: keyof T;
        /**
         * Sort direction.
         * @defaultValue 'asc'
         */
        direction?: "asc" | "desc";
    };
    /**
     * Batch input when adding them to the queue.
     * @defaultValue undefined
     */
    batch?: {
        /**
         * How to long wait before adding the batch to the queue
         */
        debounceInterval: number;
        /**
         * Function to combine the new queue item into the current batch
         * @param existingBatch - the current batch
         * @param newInput - the new item being added into the batch
         */
        batchTransformer: (existingBatch: T | undefined, newInput: T) => T;
    };
    /**
     * Function to transform the input at the beginning of each execution cycle
     * @param input - the current value being transformed
     * @param previousResult - the results from the previous execution, if any
     */
    inputTransformer?: (input: T, previousResult: Awaited<R> | undefined) => T | Promise<T>;
};
declare type Result<R> = {
    data?: R;
    message?: unknown;
};
export default function serialize<T, R, Q extends Result<R>>(func: (input: T) => R, options?: SerializeOptions<T, R>): (input: T) => Promise<Q>;
export {};
//# sourceMappingURL=index.d.ts.map