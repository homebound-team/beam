import { PropsWithChildren } from "react";
import { useResponsiveGrid, useResponsiveGridProps } from "src/components";

export interface ResponsiveGridProps extends PropsWithChildren<useResponsiveGridProps> {}

/** Helper component for generating a responsive grid */
export function ResponsiveGrid(props: ResponsiveGridProps) {
  const { children, ...hookProps } = props;
  const { gridStyles } = useResponsiveGrid(hookProps);
  return <div css={{ ...gridStyles }}>{children}</div>;
}
