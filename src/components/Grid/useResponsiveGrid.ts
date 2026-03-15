import { useMemo } from "react";
import { Css, Properties } from "src";

export interface useResponsiveGridProps {
  minColumnWidth: number;
  gap: number;
  columns: number;
}

/**
 * Returns the styles for a responsive grid.
 * Use in tandem with the `useResponsiveGridItem` hook to generate props for each grid item to ensure proper behavior at breakpoints.
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
