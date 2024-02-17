import { useState } from "react";
import { FilterDefs } from "src";
import { safeEntries } from "src/utils";

interface UsePersistedFilterProps<F> {
  filterDefs: FilterDefs<F>;
}

interface FilterHook<F> {
  filter: F;
  setFilter: (filter: F) => void;
}

export function useFilter<F>({ filterDefs }: UsePersistedFilterProps<F>): FilterHook<F> {
  const [filter, setFilter] = useState<F>(
    Object.fromEntries(
      safeEntries(filterDefs)
        .filter(([key, def]) => def(key as string).defaultValue !== undefined)
        .map(([key, def]) => [key, def(key as string).defaultValue]),
    ) as F,
  );

  return { setFilter, filter };
}
