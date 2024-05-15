import { ReactNode } from "react";
import { RowStyle } from "src/components/Table/TableStyles";
import { GridCellAlignment, Kinded, MaybeFn } from "src/components/Table/types";
import { Properties, Typography } from "src/Css";

/**
 * Allows a cell to be more than just a RectNode, i.e. declare its alignment or
 * primitive value for filtering and sorting.
 */
export type GridCellContent = {
  /** The JSX content of the cell. Virtual tables that client-side sort should use a function to avoid perf overhead. */
  content: ReactNode | (() => ReactNode);
  alignment?: GridCellAlignment;
  /** Allow value to be a function in case it's a dynamic value i.e. reading from an inline-edited proxy. */
  value?: MaybeFn<number | string | Date | boolean | null | undefined>;
  /** The value to use specifically for sorting (i.e. if `value` is used for filtering); defaults to `value`. */
  sortValue?: MaybeFn<number | string | Date | boolean | null | undefined>;
  colspan?: number;
  typeScale?: Typography;
  /** Allows the cell to stay in place when the user scrolls horizontally, i.e. frozen columns. */
  sticky?: "left" | "right";
  /** If provided, content of the cell will be wrapped within a <button /> or <a /> tag depending on if the value is a function or a string. */
  onClick?: VoidFunction | string;
  /** Custom css to apply directly to this cell, i.e. cell-specific borders. */
  css?: Properties;
  /** Allows cell to reveal content when the user hovers over a row. Content must be wrapped in an element in order to be hidden. IE <div>{value}</div>*/
  revealOnRowHover?: true;
  /** Tooltip to add to a cell */
  tooltip?: ReactNode;
  lineClamp?: 1 | 2 | 3 | 4 | 5;
};

/** Allows rendering a specific cell. */
export type RenderCellFn<R extends Kinded> = (
  idx: number,
  css: Properties,
  content: ReactNode,
  row: R,
  rowStyle: RowStyle<R> | undefined,
  classNames: string | undefined,
  onClick: VoidFunction | undefined,
  tooltip: ReactNode | undefined,
) => ReactNode;
