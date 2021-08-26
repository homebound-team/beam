import { useMemo } from "react";
import { useQueryState } from "src/hooks/useQueryState";
import { safeEntries } from "src/utils/index";

export interface GroupByHook<G extends string> {
  /** The current group by value. */
  value: G;
  /** Called when the group by have changed. */
  setValue: (groupBy: G) => void;
  /** The list of group by options. */
  options: Array<{ id: G; name: string }>;
}

export function useGroupBy<G extends string>(opts: Record<G, string>): GroupByHook<G> {
  const options: { id: G; name: string }[] = useMemo(
    () => safeEntries(opts).map(([key, value]) => ({ id: key, name: value })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [value, setValue] = useQueryState("groupBy", options[0].id);
  return { value, setValue, options };
}
