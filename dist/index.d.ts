declare type SerializeOptions<T> = {
    delay?: number;
    sortBy?: {
        key: keyof T;
        direction?: "asc" | "desc";
    };
};
declare type Result<R> = {
    data?: R;
    error?: unknown;
};
export default function serialize<T, R, Q extends Result<R>>(func: (input: T) => R, options?: SerializeOptions<T>): ((input: T) => Promise<Q>);
export {};
//# sourceMappingURL=index.d.ts.map