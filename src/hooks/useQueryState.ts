import { useCallback } from "react";
import { StringParam, useQueryParams } from "use-query-params";

export type UseQueryState<V> = [V, (value: V) => void];

/**
 * Very similar to `useState` but persists in the query string.
 *
 * It currently doesn't fallback on session storage, which maybe it should if
 * this is used for group bys, b/c that is what usePersistedFilter does.
 *
 * Also only supports string values right now.
 */
export function useQueryState<V extends string = string>(name: string, initialValue: V): UseQueryState<V> {
  const [params, setParams] = useQueryParams({ [name]: StringParam });
  const value = (params[name] as V) || initialValue;
  const setValue = useCallback((value: V) => setParams({ [name]: value }, "pushIn"), [name, setParams]);
  return [value, setValue];
}
