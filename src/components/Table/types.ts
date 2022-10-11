import { ReactElement, ReactNode } from "react";
import { GridCellContent } from "src/components/Table/components";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { Margin, Xss } from "src/Css";

export type Kinded = { kind: string };
export type GridTableXss = Xss<Margin>;
export type RenderAs = "div" | "table" | "virtual";
export type RowTuple<R extends Kinded> = [GridDataRow<R>, ReactElement];
export type ParentChildrenTuple<R extends Kinded> = [GridDataRow<R>, ParentChildrenTuple<R>[]];
export type Direction = "ASC" | "DESC";

export type MaybeFn<T> = T | (() => T);
export type GridCellAlignment = "left" | "right" | "center";

/**
 * Given an ADT of type T, performs a look up and returns the type of kind K.
 *
 * See https://stackoverflow.com/a/50125960/355031
 */
export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

/** A specific kind of row, including the GridDataRow props. */
type GridRowKind<R extends Kinded, P extends R["kind"]> = DiscriminateUnion<R, "kind", P> & {
  id: string;
  children: GridDataRow<R>[];
  selectable?: false;
};

/**
 * Defines how a single column will render each given row `kind` in `R`.
 *
 * The `S` generic is either:
 *
 * - For server-side sorting, it's the sortKey to pass back to the server to
 * request "sort by this column".
 *
 * - For client-side sorting, it's type `number`, to represent the current
 * column being sorted, in which case we use the GridCellContent.value.
 */
export type GridColumn<R extends Kinded, S = {}> = {
  [K in R["kind"]]:
    | string
    | GridCellContent
    | (DiscriminateUnion<R, "kind", K> extends { data: infer D }
        ? (
            data: D,
            opts: { row: GridRowKind<R, K>; api: GridTableApi<R>; level: number },
          ) => ReactNode | GridCellContent
        : (
            data: undefined,
            opts: { row: GridRowKind<R, K>; api: GridTableApi<R>; level: number },
          ) => ReactNode | GridCellContent);
} & {
  /**
   * The column's width.
   * - Only px, percentage, or fr units are supported, due to each GridRow acting as an independent table. This ensures consistent alignment between rows.
   * - Numbers are treated as `fr` units
   * - The default value is `1fr`
   */
  w?: number | string;
  /** The minimum width the column can shrink to */
  mw?: string;
  /** The column's default alignment for each cell. */
  align?: GridCellAlignment;
  /** Whether the column can be sorted (if client-side sorting). Defaults to true if sorting client-side. */
  clientSideSort?: boolean;
  /** This column's sort by value (if server-side sorting). */
  serverSideSortKey?: S;
  /** Allows the column to stay in place when the user scrolls horizontally */
  sticky?: "left" | "right";
  /** Prevent column from supporting RowStyle.onClick/rowLink in order to avoid nested interactivity. Defaults to true */
  wrapAction?: false;
  /** Used as a signal to defer adding the 'indent' styling */
  isAction?: true;
  /** Column name that will be used to generate an unique identifier for every row cell */
  name?: string;
  /** Flag that will allow to know which columns are hide-able */
  canHide?: boolean;
  /** Flag that will allow to know which hide-able columns are visible on initial load */
  initVisible?: boolean;
};

export const nonKindGridColumnKeys = [
  "w",
  "mw",
  "align",
  "serverSideSortKey",
  "clientSideSort",
  "sticky",
  "wrapAction",
  "isAction",
  "name",
  "canHide",
  "initVisible",
];

/**
 * The data for any row in the table, marked by `kind` so that each column knows how to render it.
 *
 * Each `kind` should contain very little presentation logic, i.e. mostly just off-the-wire data from
 * a GraphQL query.
 *
 * The presentation concerns instead mainly live in each GridColumn definition, which will format/render
 * each kind's data for that specific row+column (i.e. cell) combination.
 */
export type GridDataRow<R extends Kinded> = {
  kind: R["kind"];
  /** Combined with the `kind` to determine a table wide React key. */
  id: string;
  /** A list of parent/grand-parent ids for collapsing parent/child rows. */
  children?: GridDataRow<R>[];
  /** * Whether to pin this sort to the first/last of its parent's children.
   *
   * By default, pinned rows are always shown/not filtered out, however providing
   * the pin `filter: true` property will allow pinned rows to be hidden
   * while filtering.*/
  pin?: "first" | "last" | Pin;
  data: unknown;
  /** Whether to have the row collapsed (children not visible) on initial load. This will be ignore in subsequent re-renders of the table */
  initCollapsed?: boolean;
  /** Whether to have the row selected on initial load. This will be ignore in subsequent re-renders of the table */
  initSelected?: boolean;
  /** Whether row can be selected */
  selectable?: false;
} & IfAny<R, {}, DiscriminateUnion<R, "kind", R["kind"]>>;

/**
 * Used to indicate where to pin the DataRow and if whether it should be filtered or always visible, setting `filter` to `true` will hide this row
 * if it doesn't match the provided filtering search term
 */
export type Pin = { at: "first" | "last"; filter?: boolean };

// Use IfAny so that GridDataRow<any> doesn't devolve into any
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
