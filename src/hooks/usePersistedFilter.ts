import { useEffect, useMemo, useRef } from "react";
import { type FilterDefs, type FilterImpls } from "src/components";
import { useSessionStorage } from "src/hooks";
import { type AnyObject } from "src/types";
import { safeEntries, safeKeys } from "src/utils";
import { JsonParam, useQueryParams } from "use-query-params";

export type UsePersistedFilterProps<F> = {
  filterDefs: FilterDefs<F>;
  storageKey: string;
};

type PersistedFilterHook<F> = {
  filter: F;
  setFilter: (filter: F) => void;
};

/**
 * Persists filter details in both browser storage and query parameters.
 * If a valid filter is present in the query params, then that will be used.
 * Otherwise it looks at browser storage, and finally the defaultFilter prop.
 */
export function usePersistedFilter<F>({ storageKey, filterDefs }: UsePersistedFilterProps<F>): PersistedFilterHook<F> {
  const filterImpls = useMemo(
    () => Object.fromEntries(safeEntries(filterDefs).map(([key, def]) => [key, def(key as string)])) as FilterImpls<F>,
    [filterDefs],
  );
  const filterKeys = useMemo(() => Object.keys(filterImpls) as (keyof F)[], [filterImpls]);
  const defaultFilter = useMemo(
    () =>
      Object.fromEntries(
        safeEntries(filterImpls)
          .filter(([, def]) => def.defaultValue !== undefined)
          .map(([key, def]) => [key, def.defaultValue]),
      ),
    [filterImpls],
  );
  const [{ filter: queryParamsFilter }, setQueryParams] = useQueryParams({ filter: JsonParam });
  const [storedFilter, setStoredFilter] = useSessionStorage<unknown>(
    storageKey,
    dehydrateFilter(filterImpls, defaultFilter as F) ?? defaultFilter,
  );
  const isQueryParamFilterValid = hasValidFilterKeys(queryParamsFilter, filterKeys);
  // `use-query-params` / session storage can hand us fresh object identities even when the
  // underlying filter contents have not changed. We normalize them through a serialized snapshot
  // so downstream `useMemo`s can key off content changes instead of identity churn.
  const serializedQueryParamsFilter = useMemo(() => JSON.stringify(queryParamsFilter), [queryParamsFilter]);
  const serializedStoredFilter = useMemo(() => JSON.stringify(storedFilter), [storedFilter]);
  const queryParamsFilterSnapshot = useMemo(
    () => parseSerializedValue(serializedQueryParamsFilter),
    [serializedQueryParamsFilter],
  );
  const storedFilterSnapshot = useMemo(() => parseSerializedValue(serializedStoredFilter), [serializedStoredFilter]);
  const hydratedQueryParamsFilter = useMemo(
    () => (isQueryParamFilterValid ? hydrateFilter(filterImpls, queryParamsFilterSnapshot) : undefined),
    [filterImpls, isQueryParamFilterValid, queryParamsFilterSnapshot],
  );
  const hydratedStoredFilter = useMemo(
    () =>
      hasValidFilterKeys(storedFilterSnapshot as F, filterKeys)
        ? hydrateFilter(filterImpls, storedFilterSnapshot)
        : undefined,
    [filterImpls, filterKeys, storedFilterSnapshot],
  );
  // Prefer query params over session storage over defaults, but then keep the returned object
  // reference stable for logically-equal filters. Callers frequently put `filter` into effect
  // dependency arrays, so returning a fresh object every render can cause accidental rerender loops.
  const rawFilter = hydratedQueryParamsFilter ?? hydratedStoredFilter ?? (defaultFilter as F);
  const filter = useStableValue(rawFilter);

  const setFilter = (filter: F) => setQueryParams({ filter: dehydrateFilter(filterImpls, filter) });

  useEffect(
    () => {
      if (queryParamsFilter === undefined) {
        // if there is no filter in the query params, use stored filter
        // "replaceIn" replaces the url in history instead of creating a new history item
        // back button will go to previous url
        setQueryParams({ filter: storedFilter }, "replaceIn");
      } else if (!isQueryParamFilterValid) {
        // if there are invalid query params, fallback to the default filters
        setQueryParams({ filter: dehydrateFilter(filterImpls, defaultFilter as F) }, "replaceIn");
      } else if (JSON.stringify(queryParamsFilter) !== JSON.stringify(storedFilter)) {
        // if there is a valid filter in query params and its different from the
        // current storedFilter, use query params filter
        setStoredFilter(queryParamsFilter);
      }
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storedFilter, setStoredFilter, setQueryParams, queryParamsFilter],
  );

  return { setFilter, filter };
}

// check for valid filter keys in the query params
function hasValidFilterKeys<F>(queryParamsFilter: F, definedKeys: (keyof F)[]): queryParamsFilter is F {
  return !!queryParamsFilter && safeKeys(queryParamsFilter).every((key) => definedKeys.includes(key as keyof F));
}

function hydrateFilter<F>(filterImpls: FilterImpls<F>, value: unknown): F | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const hydratedEntries: [string, unknown][] = [];
  safeEntries(value as AnyObject).forEach(([key, rawValue]) => {
    const filter = filterImpls[key as keyof F];
    if (!filter) return;
    const hydratedValue = filter.hydrate
      ? filter.hydrate(rawValue)
      : (rawValue as Exclude<F[keyof F], null | undefined> | undefined);
    if (hydratedValue !== undefined) {
      hydratedEntries.push([key, hydratedValue]);
    }
  });
  return Object.fromEntries(hydratedEntries) as F;
}

function dehydrateFilter<F>(filterImpls: FilterImpls<F>, value: F | undefined): unknown {
  if (!value) return value;
  return Object.fromEntries(
    safeEntries(value as AnyObject).map(([key, rawValue]) => {
      const filter = filterImpls[key as keyof F];
      return [
        key,
        filter?.dehydrate ? filter.dehydrate(rawValue as Exclude<F[keyof F], null | undefined> | undefined) : rawValue,
      ];
    }),
  );
}

function parseSerializedValue(value: string | undefined): unknown {
  return value === undefined ? undefined : JSON.parse(value);
}

function useStableValue<T>(value: T): T {
  // Preserve the previous object identity until the serialized contents actually change.
  // This keeps hook consumers from seeing spurious dependency changes for equivalent filters.
  const stableValue = useRef(value);
  const stableKey = useRef(JSON.stringify(value));
  const nextKey = JSON.stringify(value);
  if (stableKey.current !== nextKey) {
    stableValue.current = value;
    stableKey.current = nextKey;
  }
  return stableValue.current;
}
