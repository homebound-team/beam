import { useContext } from "react";
import { GridCollapseContext, IconButton } from "src/components";

export interface GridTableCollapseToggleProps {
  isHeader?: boolean;
}

export function CollapseToggle({ isHeader }: GridTableCollapseToggleProps) {
  const { isCollapsed, toggleCollapse } = useContext(GridCollapseContext);
  const iconKey = isCollapsed ? "chevronRight" : "chevronDown";
  const headerIconKey = isCollapsed ? "chevronsRight" : "chevronsDown";
  return <IconButton onClick={toggleCollapse} icon={isHeader ? headerIconKey : iconKey} />;
}
