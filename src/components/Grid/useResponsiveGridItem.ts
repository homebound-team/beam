import { useContext, useMemo } from "react";
import { Css, Properties } from "src";
import { gridItemDataAttribute, ResponsiveGridConfig, ResponsiveGridContext } from "src/components/Grid/utils";

interface UseResponsiveGridItemProps {
  /** How many grid columns this item should span. Defaults to 1. */
  colSpan?: number;
  /**
   * The grid configuration for computing container-query breakpoints.
   *
   * When items are rendered inside a `ResponsiveGrid` (or a manual
   * `ResponsiveGridContext.Provider`), this is picked up from context
   * automatically and can be omitted.
   *
   * When using the hooks directly (i.e. `useResponsiveGrid` +
   * `useResponsiveGridItem` without a Provider), this **must** be supplied
   * so the item can generate the correct `@container` query styles.
   * Pass the same config object you gave to `useResponsiveGrid`:
   *
   * ```tsx
   * const gridConfig = { minColumnWidth: 276, columns: 4, gap: 24 };
   * const { gridStyles } = useResponsiveGrid(gridConfig);
   * const { gridItemProps, gridItemStyles } = useResponsiveGridItem({ colSpan: 3, gridConfig });
   * ```
   */
  gridConfig?: ResponsiveGridConfig;
}

/**
 * Returns props and styles for a responsive grid item.
 *
 * - `gridItemProps` — a data attribute used to identify the item's requested
 *   column span. Spread this onto the item's root element.
 * - `gridItemStyles` — `@container` query CSS that gracefully reduces the
 *   item's `grid-column` span as the grid container shrinks. Apply these to
 *   the item's `css` prop.
 *
 * The container query breakpoints are derived from the grid config (see
 * `UseResponsiveGridItemProps.gridConfig`). When `colSpan` is 1 or the
 * config is unavailable, `gridItemStyles` will be an empty object.
 */
export function useResponsiveGridItem(props: UseResponsiveGridItemProps): {
  gridItemProps: Record<string, number>;
  gridItemStyles: Properties;
} {
  const { colSpan = 1, gridConfig } = props;
  const contextConfig = useContext(ResponsiveGridContext);
  // Prefer explicitly passed config over context, so hook-only callers
  // (without a ResponsiveGridContext.Provider) can still get grid item styles.
  const config = gridConfig ?? contextConfig;

  const gridItemStyles = useMemo(() => {
    if (!config || colSpan <= 1) return {};
    const { minColumnWidth, gap } = config;

    // Build container query styles for each possible span from 1 to colSpan
    let styles: Properties = {};
    for (let span = 1; span < colSpan; span++) {
      const minWidth = span === 1 ? 0 : minColumnWidth * span + gap * (span - 1);
      const maxWidth = minColumnWidth * (span + 1) + gap * span;
      styles = { ...styles, ...Css.ifContainer({ gt: minWidth, lt: maxWidth }).gc(`span ${span}`).$ };
    }

    // Default style: full colSpan when container is wide enough
    const fullSpanMinWidth = minColumnWidth * colSpan + gap * (colSpan - 1);
    styles = { ...styles, ...Css.ifContainer({ gt: fullSpanMinWidth }).gc(`span ${colSpan}`).$ };

    return styles;
  }, [config, colSpan]);

  return {
    gridItemProps: { [gridItemDataAttribute]: colSpan },
    gridItemStyles,
  };
}
