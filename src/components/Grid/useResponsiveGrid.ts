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
 * ## Layout algorithm
 *
 * The grid uses `auto-fill` columns with a clamped width:
 *
 * ```
 * grid-template-columns: repeat(auto-fill, minmax(max(minColumnWidth, maxColumnWidth), 1fr))
 * ```
 *
 * where `maxColumnWidth = (100% - totalGapWidth) / columns`.
 *
 * - The `max(minColumnWidth, maxColumnWidth)` clamp means each column is *at
 *   least* `minColumnWidth` wide, but when the container is wide enough to fit
 *   all `columns`, each column grows to fill the space equally.
 * - `auto-fill` lets the browser drop columns automatically as the container
 *   shrinks — once there isn't room for the next column at `minColumnWidth`,
 *   the grid reflows to fewer columns.
 * - The grid is also a CSS `container` (`container-type: inline-size`) so that
 *   child items can use `@container` queries to adapt their `grid-column` span
 *   based on the grid's current width. See `useResponsiveGridItem`.
 *
 * ### Trade-offs
 *
 * **Pros**
 * - Fully CSS-driven reflow — no JS resize observers or manual breakpoint
 *   bookkeeping; the browser handles column count changes natively.
 * - Container queries keep span adjustments scoped to the grid's own width
 *   rather than the viewport, so the grid works correctly inside any layout
 *   (sidebars, split panes, etc.).
 *
 * **Cons**
 * - `auto-fill` can produce an empty trailing column when the container is
 *   slightly wider than `columns * minColumnWidth` but not wide enough for
 *   `columns + 1` full columns.
 * - Items that span multiple columns need coordinated `@container` queries
 *   (via `useResponsiveGridItem`) to gracefully reduce their span — without
 *   those styles an item requesting e.g. `span 3` will overflow or leave
 *   blank tracks when only 2 columns fit.
 *
 * ## Usage
 *
 * When using the hooks directly (without `ResponsiveGrid`), pass the same
 * config object to both hooks so that items can compute their container query
 * breakpoints:
 *
 * ```tsx
 * const gridConfig = { minColumnWidth: 276, columns: 4, gap: 24 };
 * const { gridStyles } = useResponsiveGrid(gridConfig);
 * const { gridItemProps, gridItemStyles } = useResponsiveGridItem({ colSpan: 3, gridConfig });
 * ```
 */
export function useResponsiveGrid(props: useResponsiveGridProps): { gridStyles: Properties } {
  const { minColumnWidth, gap, columns } = props;

  const gridStyles = useMemo(() => {
    const gapCount = columns - 1;
    const totalGapWidth = gap * gapCount;
    // When the container is wide enough for all `columns`, each column gets an
    // equal share of the remaining space after gaps are subtracted.
    const maxColumnWidth = `calc((100% - ${totalGapWidth}px) / ${columns})`;
    // The minmax clamp: columns are at least minColumnWidth, but scale up to
    // fill available space (1fr). auto-fill drops columns when they no longer fit.
    const gridTemplateColumns = `repeat(auto-fill, minmax(max(${minColumnWidth}px, ${maxColumnWidth}), 1fr))`;
    const gridGap = `${gap}px`;

    return Css.dg.gtc(gridTemplateColumns).ctis.gap(gridGap).$;
  }, [minColumnWidth, gap, columns]);

  return { gridStyles };
}
