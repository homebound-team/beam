import { Key, useEffect } from "react";
import { FilterDef } from "src/components";
import { useSessionStorage } from "src/hooks";
import { safeKeys } from "src/utils";
import { JsonParam, useQueryParams } from "use-query-params";

interface UsePersistedFilterProps<F> {
  defaultFilter: F;
  storageKey: string;
  filterDefs: { [K in keyof F]: FilterDef<Key> };
}

/** Persists filter details in both browser storage and query parameters.
 * If a valid filter is preset in the query params, then that will be used.
 * Otherwise it looks at browser storage, and finally the defaultFilter prop.
 */
export function usePersistedFilter<F>({ defaultFilter, storageKey, filterDefs }: UsePersistedFilterProps<F>) {
  const filterKeys = Object.keys(filterDefs);
  const [{ filter: queryParamsFilter }, setQueryParams] = useQueryParams({ filter: JsonParam });
  const [storedFilter, setStoredFilter] = useSessionStorage<F>(storageKey, queryParamsFilter ?? defaultFilter);
  const isQueryParamFilterValid = hasValidFilterKeys(queryParamsFilter, filterKeys);
  const filter: F = isQueryParamFilterValid ? queryParamsFilter : storedFilter ?? defaultFilter;

  const setFilter = (filter: F) => setQueryParams({ filter });

  useEffect(() => {
    console.log("what changed?", storedFilter, queryParamsFilter);
    if (queryParamsFilter === undefined) {
      // if there is no filter in the query params, use stored filter
      // "replaceIn" replaces the url in history instead of creating a new history item
      // back button will go to previous url
      setQueryParams({ filter: storedFilter }, "replaceIn");
    } else if (!isQueryParamFilterValid) {
      // if there are invalid query params, clear filters
      setQueryParams({ filter: {} }, "replaceIn");
    } else if (JSON.stringify(queryParamsFilter) !== JSON.stringify(storedFilter)) {
      // if there is a valid filter in query params and its different from the
      // current storedFilter, use query params filter
      setStoredFilter(queryParamsFilter);
    }
  }, [storedFilter, setStoredFilter, setQueryParams, queryParamsFilter]);

  return { setFilter, filter };
}

// check for valid filter keys in the query params
function hasValidFilterKeys<F>(queryParamsFilter: F, filterKeys: (keyof F)[]): queryParamsFilter is F {
  if (!queryParamsFilter) return false;
  const invalidKey = safeKeys(queryParamsFilter).find((key) => {
    return !filterKeys.includes(key);
  });
  if (invalidKey !== undefined) return false;
  return true;
}
