import { useCallback, useContext } from "react";
import { GridCollapseContext, GridDataRow, IconButton } from "src/components";

export interface GridTableCollapseToggleProps {
  row: GridDataRow<any>;
}

export function CollapseToggle(props: GridTableCollapseToggleProps) {
  const { row } = props;
  const { isCollapsed, toggleCollapsed } = useContext(GridCollapseContext);
  const toggleOnClick = useCallback(() => toggleCollapsed(row.id), [row.id, toggleCollapsed]);
  const iconKey = isCollapsed(row.id) ? "chevronRight" : "chevronDown";
  const headerIconKey = isCollapsed(row.id) ? "chevronsRight" : "chevronsDown";
  const isHeader = row.kind === "header";
  if (!isHeader && (!props.row.children || props.row.children.length === 0)) {
    return null;
  }
  return <IconButton onClick={toggleOnClick} icon={isHeader ? headerIconKey : iconKey} />;
}
