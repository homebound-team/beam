import { PropsWithChildren } from "react";
import { useResponsiveGridItem } from "src";

export interface ResponsiveGridItemProps
  extends PropsWithChildren<{
    colSpan: number;
  }> {}

/** Helper component for generating grid items with the ResponsiveGrid */
export function ResponsiveGridItem(props: ResponsiveGridItemProps) {
  const { colSpan, children } = props;
  const { gridItemProps } = useResponsiveGridItem({ colSpan });
  return <div {...gridItemProps}>{children}</div>;
}
