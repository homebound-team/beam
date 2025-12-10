import { omitKey } from "src/utils";

export function updateFilter<F, K extends keyof F>(currentFilter: F, key: K, value: F[K] | undefined): F {
  if (value === undefined) {
    return omitKey(key, currentFilter);
  } else {
    return { ...currentFilter, [key]: value };
  }
}

export const filterTestIdPrefix = "filter";
