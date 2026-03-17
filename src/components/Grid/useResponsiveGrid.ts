import { useMemo } from "react";
import { Css, Properties } from "src";

export interface useResponsiveGridProps {
  minColumnWidth: number;
  gap: number;
  columns: number;
}

/**
 * Returns container styles for a responsive CSS grid.
 *
 * Callers must provide the grid config via `ResponsiveGridContext` (or use the
 * `ResponsiveGrid` component) so that each item can call `useResponsiveGridItem`
 * and apply the returned `gridItemStyles` to achieve container-query-based
 * breakpoint behavior for multi-column spans.
 */
export function useResponsiveGrid(props: useResponsiveGridProps): { gridStyles: Properties } {
  const { minColumnWidth, gap, columns } = props;

  const gridStyles = useMemo(() => {
    const gapCount = columns - 1;
    const totalGapWidth = gap * gapCount;
    const maxColumnWidth = `calc((100% - ${totalGapWidth}px) / ${columns})`;
    const gridTemplateColumns = `repeat(auto-fill, minmax(max(${minColumnWidth}px, ${maxColumnWidth}), 1fr))`;
    const gridGap = `${gap}px`;

    return Css.dg.gtc(gridTemplateColumns).ctis.gap(gridGap).$;
  }, [minColumnWidth, gap, columns]);

  return { gridStyles };
}
