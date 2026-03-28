import { PropsWithChildren } from "react";
import { mergeProps } from "react-aria";
import { Css, useResponsiveGridItem } from "src";

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
