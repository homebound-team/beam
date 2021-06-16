export type HasIdAndName<V> = { id: V; name: string };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
