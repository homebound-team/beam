import { ReactElement, ReactNode } from "react";
import { GridCellContent } from "src/components/Table/components/cell";
import { GridDataRow, GridRowKind } from "src/components/Table/components/Row";
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
export type GridColumn<R extends Kinded> = {
  [K in R["kind"]]:
    | string
    | GridCellContent
    | (DiscriminateUnion<R, "kind", K> extends { data: infer D }
        ? (
            data: D,
            opts: { row: GridRowKind<R, K>; api: GridTableApi<R>; level: number; expanded: boolean },
          ) => ReactNode | GridCellContent
        : (
            data: undefined,
            opts: { row: GridRowKind<R, K>; api: GridTableApi<R>; level: number; expanded: boolean },
          ) => ReactNode | GridCellContent);
} & {
  /**
   * The column's width.
   * - Only px, percentage, or fr units are supported, due to each GridRow acting as an independent table. This ensures consistent alignment between rows.
   * - Numbers are treated as `fr` units
   * - The default value is `1fr`
   */
  w?: number | string;
  /** Represents the width the column will get when expanded. This prop is treated the same as the `GridColumn.w` prop.
   *  Example: Collapsed state shows number of books. Expanded state shows titles of books.
   */
  expandedWidth?: number | string;
  /** The minimum width the column can shrink to */
  mw?: string;
  /** The column's default alignment for each cell. */
  align?: GridCellAlignment;
  /** Whether the column can be sorted (if client-side sorting). Defaults to true if sorting client-side. */
  clientSideSort?: boolean;
  /** This column's sort by value (if server-side sorting). */
  serverSideSortKey?: string;
  /** Allows the column to stay in place when the user scrolls horizontally */
  sticky?: "left" | "right";
  /** Prevent column from supporting RowStyle.onClick/rowLink in order to avoid nested interactivity. Defaults to true */
  wrapAction?: false;
  /** Used as a signal to defer adding the 'indent' styling */
  isAction?: true;
  /** Column id that will be used to generate an unique identifier for every row cell */
  id?: string;
  /** String identifier of the column. Typically the same text content as in column header. This is used to in things like the Edit Columns Button */
  name?: string;
  /** Flag that will allow to know which columns are hide-able */
  canHide?: boolean;
  /** Flag that will allow to know which hide-able columns are visible on initial load */
  initVisible?: boolean;
  /** A list of columns that should only be shown when this column is "expanded" */
  expandColumns?: GridColumn<R>[] | (() => Promise<GridColumn<R>[]>);
  /** Determines whether the group should initially be expanded on load of the table */
  initExpanded?: boolean;
  /** Determines whether this column should be hidden when expanded (only the 'expandColumns' would show) */
  hideOnExpand?: boolean;
};
// export type ExpandColumnsFn<R extends Kinded> = () => Promise<GridColumn<R>[]>;
// when you do a type, you have to do an intersection - it can be this type & this type = ampersand is telling is its an intersection
export type GridColumnWithId<R extends Kinded> = GridColumn<R> & {
  id: string;
  expandColumns?: GridColumnWithId<R>[] | (() => Promise<GridColumn<R>[]>);
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
  "id",
  "canHide",
  "initVisible",
  "expandColumns",
  "initExpanded",
];

/**
 * Used to indicate where to pin the DataRow and if whether it should be filtered or always visible, setting `filter` to `true` will hide this row
 * if it doesn't match the provided filtering search term
 */
export type Pin = { at: "first" | "last"; filter?: boolean };

// Use IfAny so that GridDataRow<any> doesn't devolve into any
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

export type InfiniteScroll = {
  /** will be called when the user scrolls to the end of the list with the last item index as an argument.  */
  onEndReached: (index: number) => void;
  /** The number of pixels from the bottom of the list to eagerly trigger `onEndReached`. The default is is 500px. */
  endOffsetPx?: number;
};
