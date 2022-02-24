import { useCallback, useContext, useState } from "react";
import { GridCollapseContext, GridDataRow, IconButton } from "src/components";
import { Css } from "src/Css";

export interface GridTableCollapseToggleProps {
  row: GridDataRow<any>;
}

export function CollapseToggle(props: GridTableCollapseToggleProps) {
  const { row } = props;
  const { isCollapsed, toggleCollapsed } = useContext(GridCollapseContext);
  const [, setTick] = useState(0);
  const currentlyCollapsed = isCollapsed(row.id);
  const toggleOnClick = useCallback(() => {
    toggleCollapsed(row.id);
    setTick(Date.now());
  }, [row.id, currentlyCollapsed, toggleCollapsed]);
  const iconKey = currentlyCollapsed ? "chevronRight" : "chevronDown";
  const headerIconKey = currentlyCollapsed ? "chevronsRight" : "chevronsDown";
  const isHeader = row.kind === "header";
  if (!isHeader && (!props.row.children || props.row.children.length === 0)) {
    return null;
  }

  // Wrapping with a `line-height: 0` element. This prevents the IconButton's inline element from adding extra height to its parent container.
  return (
    <div css={Css.lh0.$}>
      <IconButton onClick={toggleOnClick} icon={isHeader ? headerIconKey : iconKey} />
    </div>
  );
}
