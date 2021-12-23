export declare type SerializeOptions<Input, Return> = {
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
        key: keyof Input;
        /**
         * Sort direction.
         * @defaultValue 'asc'
         */
        direction?: 'asc' | 'desc';
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
         * Maximum duration before a batch will close
         */
        maxDebounceInterval?: number;
        /**
         * Function to combine the new queue item into the current batch
         * @param existingBatch - the current batch
         * @param newInput - the new item being added into the batch
         */
        batchTransformer: (existingBatch: Input | undefined, newInput: Input) => Input;
    };
    /**
     * Function to transform the input at the beginning of each execution cycle
     * @param input - the current value being transformed
     * @param previousResult - the results from the previous execution, if any
     */
    inputTransformer?: (input: Input, previousResult: Awaited<Return> | undefined) => Input | Promise<Input>;
};
declare type Result<R> = {
    data?: R;
    message?: unknown;
};
export default function serialize<Input, Return, EnrichedReturn extends Result<Return>>(func: (input: Input) => Return, options?: SerializeOptions<Input, Return>): (input: Input) => Promise<EnrichedReturn>;
export {};
//# sourceMappingURL=index.d.ts.map