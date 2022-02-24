import React from "react";

/**
 * Provides each row access to a method to check if it is collapsed and toggle it's collapsed state.
 *
 * Calling `toggleCollapse` will keep the row itself showing, but will hide any
 * children rows (specifically those that have this row's `id` in their `parentIds`
 * prop).
 *
 * headerCollapsed is used to trigger rows at the root level to rerender their chevron when all are
 * collapsed/expanded.
 */
export type GridCollapseContextProps = {
  headerCollapsed: boolean;
  isCollapsed: (id: string) => boolean;
  toggleCollapsed(id: string): void;
};

export const GridCollapseContext = React.createContext<GridCollapseContextProps>({
  headerCollapsed: false,
  isCollapsed: () => false,
  toggleCollapsed: () => {},
});
