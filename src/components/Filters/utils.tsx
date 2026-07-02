import { isDefined, omitKey, safeKeys } from "src/utils";

/** Count of filter keys with a defined value. */
export function getActiveFilterCount<F extends Record<string, unknown>>(filter: F): number {
  return safeKeys(filter).filter((key) => isDefined(filter[key])).length;
}

export function updateFilter<F, K extends keyof F>(currentFilter: F, key: K, value: F[K] | undefined): F {
  if (value === undefined) {
    return omitKey(key, currentFilter);
  } else {
    return { ...currentFilter, [key]: value };
  }
}

export const filterTestIdPrefix = "filter";
