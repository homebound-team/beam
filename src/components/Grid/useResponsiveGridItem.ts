import { type Properties } from "src/Css";
import { gridItemDataAttribute, type ResponsiveGridConfig } from "src/components/Grid/utils";

/**
 * `useResponsiveGrid` now owns the runtime `@container` rule injection for the
 * entire grid, and this hook just declares the item's requested span via a data
 * attribute.
 */
interface UseResponsiveGridItemProps {
  /** How many grid columns this item should span. Defaults to 1. */
  colSpan?: number;
  /**
   * Retained for backwards compatibility.
   *
   * Span rules are now injected by `useResponsiveGrid`, so callers no longer
   * need to pass grid config into `useResponsiveGridItem`.
   */
  gridConfig?: ResponsiveGridConfig;
}

/**
 * Returns props and styles for a responsive grid item.
 *
 * - `gridItemProps` — a data attribute used to identify the item's requested
 *   column span. Spread this onto the item's root element.
 * - `gridItemStyles` — retained as an empty object for API compatibility.
 *
 * `useResponsiveGrid` injects the runtime `@container` rules for the whole
 * grid, so this hook only needs to identify the requested span.
 */
export function useResponsiveGridItem(props: UseResponsiveGridItemProps): {
  gridItemProps: Record<string, string | number>;
  gridItemStyles: Properties;
} {
  const colSpan = props.colSpan ?? 1;

  return {
    gridItemProps: { [gridItemDataAttribute]: colSpan },
    gridItemStyles: {},
  };
}
