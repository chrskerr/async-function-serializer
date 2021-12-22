export declare type SerializeOptions<T, R> = {
    delay?: number;
    sortBy?: {
        key: keyof T;
        direction?: "asc" | "desc";
    };
    batch?: {
        debounceInterval: number;
        batchTransformer: (existingBatch: T | undefined, newInput: T) => T;
    };
    inputTransformer?: (input: T, previousResult: Awaited<R> | undefined) => T | Promise<T>;
};
declare type Result<R> = {
    data?: R;
    error?: unknown;
};
export default function serialize<T, R, Q extends Result<R>>(func: (input: T) => R, options?: SerializeOptions<T, R>): ((input: T) => Promise<Q>);
export {};
//# sourceMappingURL=index.d.ts.map