import { useMemo, useState } from "react";
import { useModalContext } from "src/components/Modal/ModalContext";
import { useQueryState } from "src/hooks/useQueryState";
import { safeEntries } from "src/utils/helpers";

export type GroupByHook<G extends string> = {
  /** The current group by value. */
  value: G;
  /** Called when the group by have changed. */
  setValue: (groupBy: G) => void;
  /** The list of group by options. */
  options: Array<{ id: G; name: string }>;
};

export function useGroupBy<G extends string>(opts: Record<G, string>): GroupByHook<G> {
  const { inModal } = useModalContext();
  const options: { id: G; name: string }[] = useMemo(
    () => safeEntries(opts).map(([key, value]) => ({ id: key, name: value })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [queryValue, setQueryValue] = useQueryState("groupBy", options[0].id);
  // A modal table must not read or write the page's `groupBy` query param.
  const [localValue, setLocalValue] = useState(options[0].id);
  return {
    value: inModal ? localValue : queryValue,
    setValue: inModal ? setLocalValue : setQueryValue,
    options,
  };
}
