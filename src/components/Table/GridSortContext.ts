import React from "react";

/**
 * Provides the sorting settings to headers.
 *
 * This is broken out into it's own context (i.e. separate from `GridCollapseContextProps`)
 * so that we can have sort changes only re-render the header row, and not trigger a re-render
 * of every row in the table.
 */
export type GridSortContextProps = {
  sorted: "ASC" | "DESC" | undefined;
  toggleSort(): void;
};

export const GridSortContext = React.createContext<GridSortContextProps>({
  sorted: undefined,
  toggleSort: () => {},
});
