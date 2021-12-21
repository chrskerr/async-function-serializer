declare type SerializeOptions<T, R> = {
    delay?: number;
    sortBy?: {
        key: keyof T;
        direction?: "asc" | "desc";
    };
    passForwardDataCallback?: (input: T, previousResult: R) => Promise<T>;
};
declare type Result<R> = {
    data?: R;
    error?: unknown;
};
export default function serialize<T, R, Q extends Result<R>>(func: (input: T) => R, options?: SerializeOptions<T, R>): ((input: T) => Promise<Q>);
export {};
//# sourceMappingURL=index.d.ts.map