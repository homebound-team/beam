import { useContext } from "react";
import { GridDataRow, HEADER, IconButton, IconButtonProps, KEPT_GROUP, TableStateContext } from "src/components/index";
import { useComputed } from "src/hooks";

export interface GridTableCollapseToggleProps extends Pick<IconButtonProps, "compact"> {
  row: GridDataRow<any>;
}

/** Provides a chevron icons to collapse/un-collapse for parent/child tables. */
export function CollapseToggle(props: GridTableCollapseToggleProps) {
  const { row, compact } = props;
  const { tableState } = useContext(TableStateContext);

  const isCollapsed = useComputed(() => tableState.isCollapsed(row.id), [tableState]);
  const iconKey = isCollapsed ? "chevronRight" : "chevronDown";
  const headerIconKey = isCollapsed ? "chevronsRight" : "chevronsDown";

  // If we're not a header and not the selected group row, only render a toggle if we have child rows to actually collapse
  const isHeader = row.kind === HEADER;
  const isKeptGroup = row.kind === KEPT_GROUP;
  const hasChildren = row.children ? row.children.length > 0 : false;
  if (!isHeader && !isKeptGroup && !hasChildren) {
    return null;
  }

  return (
    <IconButton
      onClick={() => tableState.toggleCollapsed(row.id)}
      icon={isHeader ? headerIconKey : iconKey}
      compact={compact}
    />
  );
}
