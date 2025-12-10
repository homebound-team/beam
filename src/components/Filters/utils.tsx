import { FilterDefs, FilterImpls } from "src/components/Filters/types";
import { Value } from "src/inputs/Value";
import { omitKey, safeEntries, safeKeys } from "src/utils";

export interface GroupByConfig<G extends Value = string> {
  /** The current group by value. */
  value: G;
  /** Called when the group by have changed. */
  setValue: (groupBy: G) => void;
  /** The list of group by options. */
  options: Array<{ id: G; name: string }>;
}

export function updateFilter<F, K extends keyof F>(currentFilter: F, key: K, value: F[K] | undefined): F {
  if (value === undefined) {
    return omitKey(key, currentFilter);
  } else {
    return { ...currentFilter, [key]: value };
  }
}

/** Convert FilterDefs to FilterImpls by evaluating the factory functions */
export function buildFilterImpls<F extends Record<string, unknown>>(filterDefs: FilterDefs<F>): FilterImpls<F> {
  return Object.fromEntries(safeEntries(filterDefs).map(([key, fn]) => [key, fn(key as string)])) as FilterImpls<F>;
}

/** Calculate the number of active (non-undefined) filters */
export function getActiveFilterCount<F extends Record<string, unknown>>(filter: F): number {
  return safeKeys(filter).filter((key) => filter[key] !== undefined).length;
}

export const filterTestIdPrefix = "filter";
