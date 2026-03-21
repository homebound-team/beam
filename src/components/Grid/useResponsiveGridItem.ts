import { useContext, useEffect, useMemo } from "react";
import { Properties } from "src";
import { gridItemDataAttribute, ResponsiveGridConfig, ResponsiveGridContext } from "src/components/Grid/utils";

const injectedResponsiveGridClasses = new Set<string>();
let responsiveGridStyleEl: HTMLStyleElement | undefined;

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
  gridItemProps: Record<string, string | number>;
  gridItemStyles: Properties;
} {
  const { colSpan = 1, gridConfig } = props;
  const contextConfig = useContext(ResponsiveGridContext);
  // Prefer explicitly passed config over context, so hook-only callers
  // (without a ResponsiveGridContext.Provider) can still get grid item styles.
  const config = gridConfig ?? contextConfig;

  const { className, cssText } = useMemo(() => {
    if (!config || colSpan <= 1) return { className: "", cssText: "" };
    const { minColumnWidth, gap } = config;
    const className = responsiveGridItemClassName(config, colSpan);
    const rules: string[] = [];

    for (let span = 1; span < colSpan; span++) {
      const minWidth = span === 1 ? 0 : minColumnWidth * span + gap * (span - 1);
      const maxWidth = minColumnWidth * (span + 1) + gap * span;
      rules.push(
        `@container (min-width: ${minWidth + 1}px) and (max-width: ${maxWidth}px) { .${className} { grid-column: span ${span}; } }`,
      );
    }

    const fullSpanMinWidth = minColumnWidth * colSpan + gap * (colSpan - 1);
    rules.push(`@container (min-width: ${fullSpanMinWidth + 1}px) { .${className} { grid-column: span ${colSpan}; } }`);

    return { className, cssText: rules.join("\n") };
  }, [config, colSpan]);

  useResponsiveGridItemStyle(className, cssText);

  return {
    gridItemProps: { [gridItemDataAttribute]: colSpan, ...(className ? { className } : {}) },
    gridItemStyles: {},
  };
}

function useResponsiveGridItemStyle(className: string, cssText: string) {
  useEffect(
    function () {
      if (!className || !cssText || typeof document === "undefined") return;

      if (!responsiveGridStyleEl) {
        responsiveGridStyleEl = document.createElement("style");
        responsiveGridStyleEl.setAttribute("data-responsive-grid-item-styles", "true");
        document.head.appendChild(responsiveGridStyleEl);
      }

      if (!injectedResponsiveGridClasses.has(className)) {
        responsiveGridStyleEl.textContent = `${responsiveGridStyleEl.textContent}\n${cssText}`.trim();
        injectedResponsiveGridClasses.add(className);
      }
    },
    [className, cssText],
  );
}

function responsiveGridItemClassName(config: ResponsiveGridConfig, colSpan: number) {
  return `responsive-grid-item-${config.minColumnWidth}-${config.gap}-${config.columns}-${colSpan}`;
}
