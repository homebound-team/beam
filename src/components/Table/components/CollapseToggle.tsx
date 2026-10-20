import { useContext } from "react";
import type { IconButtonProps } from "src/components/IconButton";
import { IconButton } from "src/components/IconButton";
import type { GridDataRow } from "src/components/Table/components/Row";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { HEADER, KEPT_GROUP } from "src/components/Table/utils/utils";
import { useComputed } from "src/hooks/useComputed";

export type GridTableCollapseToggleProps = {
  row: GridDataRow<any>;
} & Pick<IconButtonProps, "compact">;

/** Header, kept-group, and parent rows show a chevron. Leaves do not. */
export function showsCollapseToggle(row: GridDataRow<any>, isKeptSelectedRow = false): boolean {
  if (isKeptSelectedRow) return false;
  if (row.kind === HEADER || row.kind === KEPT_GROUP) return true;
  return !!row.children?.length;
}

/** Provides a chevron icons to collapse/un-collapse for parent/child tables. */
export function CollapseToggle(props: GridTableCollapseToggleProps) {
  const { row, compact } = props;
  const { tableState } = useContext(TableStateContext);

  const isCollapsed = useComputed(() => tableState.isCollapsed(row.id), [tableState]);
  const iconKey = isCollapsed ? "chevronRight" : "chevronDown";
  const headerIconKey = isCollapsed ? "chevronsRight" : "chevronsDown";

  if (!showsCollapseToggle(row)) return null;

  return (
    <IconButton
      onClick={() => tableState.toggleCollapsed(row.id)}
      icon={row.kind === HEADER ? headerIconKey : iconKey}
      compact={compact}
    />
  );
}
