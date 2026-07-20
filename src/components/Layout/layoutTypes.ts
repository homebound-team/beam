import { ButtonProps } from "src/components/Button";
import { GridDataRow } from "src/components/Table";
import { GridTableProps } from "src/components/Table/GridTable";
import { GridTableXss, Kinded } from "src/components/Table/types";
import { Only } from "src/Css";
import { GridStyle, GridStyleDef } from "../Table/TableStyles";
import { QueryResult } from "./GridTableLayout/QueryTable";

/** Shared action button props used across layout header and panel components. */
export type ActionButtonProps = Pick<ButtonProps, "onClick" | "label" | "disabled" | "tooltip" | "icon">;

type OmittedTableProps = "filter" | "stickyHeader" | "style" | "rows";

export type BaseTableProps<R extends Kinded, X extends Only<GridTableXss, X>> = Omit<
  GridTableProps<R, X>,
  OmittedTableProps
>;

// Note: the `?: never` fields on each arm prevent passing both `rows` and `query` at the same time.
export type GridTablePropsWithRows<R extends Kinded, X extends Only<GridTableXss, X>> = BaseTableProps<R, X> & {
  rows: GridTableProps<R, X>["rows"];
  query?: never;
  createRows?: never;
  style?: GridStyle | GridStyleDef;
};

export type BaseQueryTableProps<R extends Kinded, X extends Only<GridTableXss, X>, QData> = BaseTableProps<R, X> & {
  query: QueryResult<QData>;
  createRows: (data: QData | undefined) => GridDataRow<R>[];
  rows?: never;
  style?: GridStyle | GridStyleDef;
};

export function isGridTableProps<R extends Kinded, X extends Only<GridTableXss, X>, Q extends { rows?: never }>(
  props: GridTablePropsWithRows<R, X> | Q,
): props is GridTablePropsWithRows<R, X> {
  return "rows" in props;
}
