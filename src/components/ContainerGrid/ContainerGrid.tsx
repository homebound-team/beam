import { Css, Properties } from "src";
import { ReactNode, useRef } from "react";
import { ContainerGridProvider } from "src/components/ContainerGrid/ContainerGridContext";
import { defaultGridProps } from "src/components/ContainerGrid/utils";

export type ContainerGridProps = {
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
  children: ReactNode;
  xss?: Properties;
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
export function ContainerGrid(props: ContainerGridProps) {
  const {
    columns = defaultGridProps.columns,
    gap = defaultGridProps.gap,
    lg = defaultGridProps.lg,
    md = defaultGridProps.md,
    sm = defaultGridProps.sm,
    children,
    xss,
  } = props;
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      css={{
        ...Css.ctis.dg.gtc(`repeat(${columns}, minmax(0, 1fr))`).gapPx(gap).$,
        ...xss,
      }}
    >
      <ContainerGridProvider sm={sm} lg={lg} md={md} columns={columns} gap={gap} containerRef={ref}>
        {children}
      </ContainerGridProvider>
    </div>
  );
}
