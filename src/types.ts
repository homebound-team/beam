export type HasIdAndName<V = string> = { id: V; name: string };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type Callback = () => void;
export type CheckFn = () => boolean;
