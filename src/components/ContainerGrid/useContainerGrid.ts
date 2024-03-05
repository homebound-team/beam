import { useMemo } from "react";
import { Css, Properties } from "src";

export type UseContainerGridProps = {
  /** Default to 12 columns */
  columns?: number;
  /** Default to 16px gap */
  gap?: number;
  /** Default to 1440px (upper bounds of the `lg` breakpoint) */
  lg?: number;
  /** Default to 1024px (upper bounds of the `md` breakpoint) */
  md?: number;
  /** Default to 600px (upper bounds of the `sm` breakpoint) */
  sm?: number;
};

/**
 * Creates the styles needed for a CSS Grid layout with container queries.
 * Breakpoint properties represent the upper bound of the breakpoint.
 * Example: { sm: 600, md: 1024, lg: 1440 } Results in:
 * sm: 0 - 600px
 * md: 601px - 1024px
 * lg: 1025px - 1440px
 * xl: 1441px - Infinity
 */
export function useContainerGrid(props: UseContainerGridProps): {
  gridStyles: Properties;
  gridDefs: ContainerGridDefs;
} {
  const {
    columns = defaultGridProps.columns,
    gap = defaultGridProps.gap,
    lg = defaultGridProps.lg,
    md = defaultGridProps.md,
    sm = defaultGridProps.sm,
  } = props;

  const gridStyles: Properties = useMemo(() => {
    return Css.ctis.dg.gtc(`repeat(${columns}, minmax(0, 1fr))`).gapPx(gap).$;
  }, [columns, gap, lg, md, sm]);

  const gridDefs = useMemo(() => {
    return { columns, gap, lg, md, sm };
  }, [columns, gap, lg, md, sm]);

  return { gridStyles, gridDefs };
}

export type ContainerGridDefs = Required<UseContainerGridProps>;
const defaultGridProps: ContainerGridDefs = {
  columns: 12,
  gap: 16,
  lg: 1440,
  md: 1024,
  sm: 600,
};
