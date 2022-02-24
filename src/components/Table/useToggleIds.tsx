import { useCallback, useMemo, useState } from "react";
import { GridCollapseContextProps } from "src/components/Table/GridCollapseContext";
import { GridDataRow, Kinded } from "src/components/Table/types";

/**
 * A custom hook to manage a list of ids.
 *
 * What's special about this hook is that we manage a stable identity
 * for the `toggleId` function, so that rows that have _not_ toggled
 * themselves on/off will have an unchanged callback and so not be
 * re-rendered.
 *
 * That said, when they do trigger a `toggleId`, the stable/"stale" callback
 * function should see/update the latest list of values, which is not possible with a
 * traditional `useState` hook because it captures the original/stale list identity.
 */
export function useToggleIds(
  rows: GridDataRow<Kinded>[],
  persistCollapse: string | undefined,
): readonly [string[], GridCollapseContextProps, GridCollapseContextProps] {
  // Make a list that we will only mutate, so that our callbacks have a stable identity.
  const [collapsedIds] = useState<string[]>(getCollapsedRows(persistCollapse));
  // Use this to trigger the component to re-render even though we're not calling `setList`
  const [tick, setTick] = useState<string>("");

  // Checking whether something is collapsed does not depend on anything
  const isCollapsed = useCallback(
    (id: string) => collapsedIds.includes(id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const collapseAllContext = useMemo(
    () => {
      // Create the stable `toggleCollapsed`, i.e. we are purposefully passing an (almost) empty dep list
      // Since only toggling all rows required knowledge of what the rows are
      const toggleAll = (_id: string) => {
        // We have different behavior when going from expand/collapse all.
        const isAllCollapsed = collapsedIds[0] === "header";
        collapsedIds.splice(0, collapsedIds.length);
        if (isAllCollapsed) {
          // Expand all means keep `collapsedIds` empty
        } else {
          // Otherwise push `header` on the list as a hint that we're in the collapsed-all state
          collapsedIds.push("header");
          // Find all non-leaf rows so that toggling "all collapsed" -> "all not collapsed" opens
          // the parent rows of any level.
          const parentIds = new Set<string>();
          const todo = [...rows];
          while (todo.length > 0) {
            const r = todo.pop()!;
            if (r.children) {
              parentIds.add(r.id);
              todo.push(...r.children);
            }
          }
          // And then mark all parent rows as collapsed.
          collapsedIds.push(...parentIds);
        }
        if (persistCollapse) {
          localStorage.setItem(persistCollapse, JSON.stringify(collapsedIds));
        }
        // Trigger a re-render
        setTick(collapsedIds.join(","));
      };
      return { headerCollapsed: isCollapsed("header"), isCollapsed, toggleCollapsed: toggleAll };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows],
  );

  const collapseRowContext = useMemo(
    () => {
      // Create the stable `toggleCollapsed`, i.e. we are purposefully passing an empty dep list
      // Since toggling a single row does not need to know about the other rows
      const toggleRow = (id: string) => {
        // This is the regular/non-header behavior to just add/remove the individual row id
        const i = collapsedIds.indexOf(id);
        if (i === -1) {
          collapsedIds.push(id);
        } else {
          collapsedIds.splice(i, 1);
        }
        if (persistCollapse) {
          localStorage.setItem(persistCollapse, JSON.stringify(collapsedIds));
        }
        // Trigger a re-render
        setTick(collapsedIds.join(","));
      };
      return { headerCollapsed: isCollapsed("header"), isCollapsed, toggleCollapsed: toggleRow };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collapseAllContext.isCollapsed("header")],
  );

  // Return a copy of the list, b/c we want external useMemos that do explicitly use the
  // entire list as a dep to re-render whenever the list is changed (which they need to
  // see as new list identity).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const copy = useMemo(() => [...collapsedIds], [tick, collapsedIds]);
  return [copy, collapseAllContext, collapseRowContext] as const;
}

// Get the rows that are already in the toggled state, so we can keep them toggled
function getCollapsedRows(persistCollapse: string | undefined): string[] {
  if (!persistCollapse) return [];
  const collapsedGridRowIds = localStorage.getItem(persistCollapse);
  return collapsedGridRowIds ? JSON.parse(collapsedGridRowIds) : [];
}
