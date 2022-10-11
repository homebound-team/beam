import { useContext } from "react";
import { GridDataRow, IconButton, IconButtonProps, RowStateContext } from "src/components/index";
import { useComputed } from "src/hooks";

export interface GridTableCollapseToggleProps extends Pick<IconButtonProps, "compact"> {
  row: GridDataRow<any>;
}

/** Provides a chevron icons to collapse/un-collapse for parent/child tables. */
export function CollapseToggle(props: GridTableCollapseToggleProps) {
  const { row, compact } = props;
  const { rowState } = useContext(RowStateContext);

  const isCollapsed = useComputed(() => rowState.isCollapsed(row.id), [rowState]);
  const iconKey = isCollapsed ? "chevronRight" : "chevronDown";
  const headerIconKey = isCollapsed ? "chevronsRight" : "chevronsDown";

  // If we're not a header, only render a toggle if we have child rows to actually collapse
  const isHeader = row.kind === "header";
  if (!isHeader && (!row.children || row.children.length === 0)) {
    return null;
  }

  return (
    <IconButton
      onClick={() => rowState.toggleCollapsed(row.id)}
      icon={isHeader ? headerIconKey : iconKey}
      compact={compact}
    />
  );
}
