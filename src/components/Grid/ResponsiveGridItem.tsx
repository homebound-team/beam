import type { PropsWithChildren } from "react";
import { mergeProps } from "react-aria";
import { Css } from "src/Css";
import { useResponsiveGridItem } from "src/components/Grid/useResponsiveGridItem";

export type ResponsiveGridItemProps = PropsWithChildren<{
  colSpan: number;
}>;

/** Helper component for generating grid items with the ResponsiveGrid */
export function ResponsiveGridItem(props: ResponsiveGridItemProps) {
  const { colSpan, children } = props;
  const { gridItemProps, gridItemStyles } = useResponsiveGridItem({ colSpan });
  // Use mergeProps so we combine classNames
  return <div {...mergeProps(gridItemProps, Css.props(gridItemStyles))}>{children}</div>;
}
