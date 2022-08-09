import { useEffect, useMemo } from "react";
import { FilterDefs } from "src/components";
import { useSessionStorage } from "src/hooks";
import { safeEntries, safeKeys } from "src/utils";
import { JsonParam, useQueryParams } from "use-query-params";

interface UsePersistedFilterProps<F> {
  filterDefs: FilterDefs<F>;
  storageKey: string;
}

interface PersistedFilterHook<F> {
  filter: F;
  setFilter: (filter: F) => void;
}

/**
 * Persists filter details in both browser storage and query parameters.
 * If a valid filter is present in the query params, then that will be used.
 * Otherwise it looks at browser storage, and finally the defaultFilter prop.
 */
export function usePersistedFilter<F>({ storageKey, filterDefs }: UsePersistedFilterProps<F>): PersistedFilterHook<F> {
  const filterKeys = Object.keys(filterDefs);
  // no default value
  const defaultFilter = useMemo(
    () =>
      Object.fromEntries(
        safeEntries(filterDefs)
          .filter(([key, def]) => def(key as string).defaultValue !== undefined)
          .map(([key, def]) => [key, def(key as string).defaultValue]),
      ),
    [filterDefs],
  );
  // key as a string to pass in queryParamKey
  const [{ filter: queryParamsFilter }, setQueryParams] = useQueryParams({ filter: JsonParam });
  const [storedFilter, setStoredFilter] = useSessionStorage<F>(storageKey, queryParamsFilter ?? defaultFilter);
  const isQueryParamFilterValid = hasValidFilterKeys(queryParamsFilter, filterKeys);
  const filter: F = isQueryParamFilterValid ? queryParamsFilter : storedFilter ?? defaultFilter;
// set querystorage 
  const setFilter = (filter: F) => setQueryParams({ filter });

  useEffect(() => {
    if (queryParamsFilter === undefined) {
      // if there is no filter in the query params, use stored filter
      // "replaceIn" replaces the url in history instead of creating a new history item
      // back button will go to previous url
      setQueryParams({ filter: storedFilter }, "replaceIn");
    } else if (!isQueryParamFilterValid) {
      // if there are invalid query params, fallback to the default filters
      setQueryParams({ filter: defaultFilter }, "replaceIn");
    } else if (JSON.stringify(queryParamsFilter) !== JSON.stringify(storedFilter)) {
      // if there is a valid filter in query params and its different from the
      // current storedFilter, use query params filter
      setStoredFilter(queryParamsFilter);
    }
  }, [storedFilter, setStoredFilter, setQueryParams, queryParamsFilter]);

  return { setFilter, filter };
}

// check for valid filter keys in the query params
function hasValidFilterKeys<F>(queryParamsFilter: F, definedKeys: (keyof F)[]): queryParamsFilter is F {
  return queryParamsFilter && safeKeys(queryParamsFilter).every((key) => definedKeys.includes(key));
}
