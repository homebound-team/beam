import { useEffect } from "react";
import { useSessionStorage } from "src/hooks";
import { JsonParam, useQueryParams } from "use-query-params";

interface UseFilterOpts<F> {
  defaultFilter: F;
  storageKey: string;
}

export function useFilter<F>({ defaultFilter, storageKey }: UseFilterOpts<F>) {
  const [{ filter: queryParamsFilter }, setQueryParams] = useQueryParams({ filter: JsonParam });
  const [storedFilter, setStoredFilter] = useSessionStorage<F>(storageKey, defaultFilter);
  const queryFilter: F = storedFilter ?? queryParamsFilter ?? defaultFilter;

  const setFilter = (filter: F) => setQueryParams({ filter });

  useEffect(() => {
    if (queryParamsFilter === undefined) {
      // if there is no filter in the query params, use stored filter
      // "replaceIn" replaces the url in history instead of creating a new history item
      // back button will go to previous url
      setQueryParams({ filter: storedFilter }, "replaceIn");
    } else if (JSON.stringify(queryParamsFilter) !== JSON.stringify(storedFilter)) {
      // if there is a valid filter in query params and its different from the
      // current storedFilter, use query params filter
      setStoredFilter(queryParamsFilter);
    }
  }, [storedFilter, setStoredFilter, setQueryParams, queryParamsFilter]);

  return { setFilter, queryFilter };
}
