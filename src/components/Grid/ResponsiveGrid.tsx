import { PropsWithChildren, useMemo } from "react";
import { useResponsiveGrid, useResponsiveGridProps } from "src/components";
import { ResponsiveGridContext } from "src/components/Grid/utils";

export interface ResponsiveGridProps extends PropsWithChildren<useResponsiveGridProps> {}

/** Helper component for generating a responsive grid */
export function ResponsiveGrid(props: ResponsiveGridProps) {
  const { children, minColumnWidth, gap, columns } = props;
  const { gridStyles } = useResponsiveGrid({ minColumnWidth, gap, columns });
  const config = useMemo(() => ({ minColumnWidth, gap, columns }), [minColumnWidth, gap, columns]);
  return (
    <ResponsiveGridContext.Provider value={config}>
      <div css={gridStyles}>{children}</div>
    </ResponsiveGridContext.Provider>
  );
}
