import { type PropsWithChildren, useMemo } from "react";
import { useResponsiveGrid, type useResponsiveGridProps } from "src/components/Grid/useResponsiveGrid";
import { ResponsiveGridContext } from "src/components/Grid/utils";

export type ResponsiveGridProps = PropsWithChildren<useResponsiveGridProps>;

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
