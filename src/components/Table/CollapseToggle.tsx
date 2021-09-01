import { useContext } from "react";
import { GridCollapseContext, GridDataRow, IconButton } from "src/components";

export interface GridTableCollapseToggleProps {
  row: GridDataRow<any>;
}

export function CollapseToggle(props: GridTableCollapseToggleProps) {
  const { row } = props;
  const { isCollapsed, toggleCollapse } = useContext(GridCollapseContext);
  const iconKey = isCollapsed ? "chevronRight" : "chevronDown";
  const headerIconKey = isCollapsed ? "chevronsRight" : "chevronsDown";
  const isHeader = row.kind === "header";
  if (!isHeader && (!props.row.children || props.row.children.length === 0)) {
    return null;
  }
  return <IconButton onClick={toggleCollapse} icon={isHeader ? headerIconKey : iconKey} />;
}
