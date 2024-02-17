import { useMemo } from "react";
import { Css, Properties } from "src";
import { gridItemDataAttribute } from "src/components/Grid/utils";

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

    // Generate the container queries for each possible colspan for grid items.
    const gridItemSpanStyles = Array.from({ length: columns }, (_, i) => {
      const span = i + 1;
      // Generate the CSS selectors for each grid item that spans `span` columns.
      const targets = Array.from(
        { length: columns - span },
        (_, s) => `& > [${gridItemDataAttribute}='${s + span + 1}']`,
      ).join(", ");

      // Define the breakpoint values for the container query.
      const minWidth = span === 1 ? 0 : minColumnWidth * span + gap * i;
      const maxWidth = minColumnWidth * (span + 1) + gap * span;

      const style = {
        // Using the `targets` selector, add the container query for the grid item.
        // `targets` may be empty when the span is the same as the number of columns.
        ...(targets
          ? Css.addIn(targets, Css.ifContainer({ gt: minWidth, lt: maxWidth }).gc(`span ${span}`).$).$
          : undefined),
        // Add the default style for the grid item as a helper for the implementer to not have to define their `grid-column: span X`
        // Uses `&&` selector to change the selector value to avoid being overridden by above container query.
        ...(span !== 1
          ? Css.addIn(
              `&& > [${gridItemDataAttribute}='${span}']`,
              Css.ifContainer({ gt: minWidth }).gc(`span ${span}`).$,
            ).$
          : undefined),
      };

      return style;
    }).filter((s) => Object.keys(s).length > 0);

    return {
      ...Css.dg.gtc(gridTemplateColumns).ctis.gap(gridGap).$,
      ...Object.assign({}, ...gridItemSpanStyles),
    };
  }, [minColumnWidth, gap, columns]);

  return { gridStyles };
}
