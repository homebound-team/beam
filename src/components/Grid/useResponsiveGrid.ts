import { useMemo } from "react";
import { Css, type Properties, useRuntimeStyle } from "src/Css";
import { gridItemDataAttribute } from "src/components/Grid/utils";

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
 *   child items can adapt their `grid-column` span based on the grid's current
 *   width. `useResponsiveGrid` injects those `@container` rules at runtime,
 *   while `useResponsiveGridItem` marks each item with its requested span.
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
 * - Items that span multiple columns still need `useResponsiveGridItem` so the
 *   grid's runtime `@container` rules know which span to apply. Without that
 *   data attribute, an item requesting e.g. `span 3` will overflow or leave
 *   blank tracks when only 2 columns fit.
 *
 * ## Usage
 *
 * When using the hooks directly (without `ResponsiveGrid`), call
 * `useResponsiveGrid` for the container and `useResponsiveGridItem` for each
 * child item. The grid hook injects all runtime `@container` rules for the
 * configured column spans, so items only need to expose their requested span:
 *
 * ```tsx
 * const gridConfig = { minColumnWidth: 276, columns: 4, gap: 24 };
 * const { gridStyles } = useResponsiveGrid(gridConfig);
 * const { gridItemProps } = useResponsiveGridItem({ colSpan: 3 });
 * ```
 */
export function useResponsiveGrid(props: useResponsiveGridProps): { gridStyles: Properties } {
  const { minColumnWidth, gap, columns } = props;

  const gridClassName = useMemo(
    function () {
      return responsiveGridClassName(minColumnWidth, gap, columns);
    },
    [minColumnWidth, gap, columns],
  );

  const gridItemRuntimeStyles = useMemo(
    function () {
      return buildResponsiveGridItemRuntimeStyles(minColumnWidth, gap, columns, gridClassName);
    },
    [minColumnWidth, gap, columns, gridClassName],
  );

  useRuntimeStyle(gridItemRuntimeStyles);

  const gridStyles = useMemo(
    function () {
      const gapCount = columns - 1;
      const totalGapWidth = gap * gapCount;
      // When the container is wide enough for all `columns`, each column gets an
      // equal share of the remaining space after gaps are subtracted.
      const maxColumnWidth = `calc((100% - ${totalGapWidth}px) / ${columns})`;
      // The minmax clamp: columns are at least minColumnWidth, but scale up to
      // fill available space (1fr). auto-fill drops columns when they no longer fit.
      const gridTemplateColumns = `repeat(auto-fill, minmax(max(${minColumnWidth}px, ${maxColumnWidth}), 1fr))`;
      const gridGap = `${gap}px`;

      return Css.dg.gtc(gridTemplateColumns).ctis.gap(gridGap).className(gridClassName).$;
    },
    [minColumnWidth, gap, columns, gridClassName],
  );

  return { gridStyles };
}

/** Builds runtime `@container` rules for all item spans in this grid. */
function buildResponsiveGridItemRuntimeStyles(
  minColumnWidth: number,
  gap: number,
  columns: number,
  gridClassName: string,
): Record<string, string> {
  if (columns <= 1) return {};

  const queries = new Map<string, string[]>();

  for (let requestedSpan = 2; requestedSpan <= columns; requestedSpan++) {
    for (let appliedSpan = 1; appliedSpan < requestedSpan; appliedSpan++) {
      const minWidth = appliedSpan === 1 ? 0 : minColumnWidth * appliedSpan + gap * (appliedSpan - 1);
      const maxWidth = minColumnWidth * (appliedSpan + 1) + gap * appliedSpan;
      const query = `@container (min-width: ${minWidth + 1}px) and (max-width: ${maxWidth}px)`;
      appendResponsiveGridItemRule(queries, query, gridClassName, requestedSpan, appliedSpan);
    }

    const fullSpanMinWidth = minColumnWidth * requestedSpan + gap * (requestedSpan - 1);
    appendResponsiveGridItemRule(
      queries,
      `@container (min-width: ${fullSpanMinWidth + 1}px)`,
      gridClassName,
      requestedSpan,
      requestedSpan,
    );
  }

  return Object.fromEntries(
    Array.from(queries.entries(), function (entry) {
      const query = entry[0];
      const rules = entry[1];
      return [query, rules.join("\n")];
    }),
  );
}

/** Appends one item-span rule into an aggregated `@container` block. */
function appendResponsiveGridItemRule(
  queries: Map<string, string[]>,
  query: string,
  gridClassName: string,
  requestedSpan: number,
  appliedSpan: number,
): void {
  const selector = `.${gridClassName} [${gridItemDataAttribute}="${requestedSpan}"]`;
  const rule = `${selector} { grid-column: span ${appliedSpan}; }`;
  const rules = queries.get(query);

  if (rules) {
    rules.push(rule);
  } else {
    queries.set(query, [rule]);
  }
}

/** Creates the shared class name used to scope each grid's runtime rules. */
function responsiveGridClassName(minColumnWidth: number, gap: number, columns: number): string {
  return `responsive-grid-${minColumnWidth}-${gap}-${columns}`;
}
