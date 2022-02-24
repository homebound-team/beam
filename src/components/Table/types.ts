import { ReactElement, ReactNode } from "react";
import { PresentationContextProps, PresentationFieldProps } from "src/components/PresentationContext";
import { ChromeRow } from "src/components/Table/nestedCards";
import { Margin, Palette, Properties, Typography, Xss } from "src/Css";

export type Direction = "ASC" | "DESC";
export type Kinded = { kind: string };
export type GridTableXss = Xss<Margin>;

/** The GridDataRow is optional b/c the nested card chrome rows only have ReactElements. */
export type RowTuple<R extends Kinded> = [GridDataRow<R> | ChromeRow, ReactElement];

/**
 * The sort settings for the current table; whether it's client-side or server-side.
 *
 * If client-side, GridTable will internally sort rows based on the current sort column's
 * GridCellContent.value for each cell.
 *
 * If server-side, we assume the rows are in the order as defined by `value`, and `onSort`
 * will be called when the user clicks a column to request changing the column/order.
 *
 * Note that we don't support multiple sort criteria, i.e. sort by column1 desc _and then_
 * column2 asc.
 */
export type GridSortConfig<S> =
  | {
      on: "client";
      /** The optional initial column (index in columns) and direction to sort. */
      initial?: [S | GridColumn<any>, Direction] | undefined;
    }
  | {
      on: "server";
      /** The current sort by value + direction (if server-side sorting). */
      value?: [S, Direction];
      /** Callback for when the column is sorted (if server-side sorting). Parameters set to `undefined` is a signal to return to the initial sort state */
      onSort: (orderBy: S | undefined, direction: Direction | undefined) => void;
    };

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
        ? (data: D, row: GridRowKind<R, K>) => ReactNode | GridCellContent
        : (row: GridRowKind<R, K>) => ReactNode | GridCellContent);
} & {
  /**
   * The column's width.
   * - Only px, percentage, or fr units are supported, due to each GridRow acting as an independent table. This ensures consistent alignment between rows.
   * - Numbers are treated as `fr` units
   * - The default value is `1fr`
   */
  w?: number | string;
  /** The minimum width the column can shrink to. Only applies if the table's width is not set to 100% (default) */
  mw?: string;
  /** The column's default alignment for each cell. */
  align?: GridCellAlignment;
  /** Whether the column can be sorted (if client-side sorting). Defaults to true if sorting client-side. */
  clientSideSort?: boolean;
  /** This column's sort by value (if server-side sorting). */
  serverSideSortKey?: S;
  sticky?: "left" | "right";
};

/** Allows rendering a specific cell. */
export type RenderCellFn<R extends Kinded> = (
  idx: number,
  css: Properties,
  content: ReactNode,
  row: R,
  rowStyle: RowStyle<R> | undefined,
) => ReactNode;

/** Defines row-specific styling for each given row `kind` in `R` */
export type GridRowStyles<R extends Kinded> = {
  [P in R["kind"]]?: RowStyle<DiscriminateUnion<R, "kind", P>>;
};

export interface RowStyle<R extends Kinded> {
  /** Applies this css to the wrapper row, i.e. for row-level hovers. */
  rowCss?: Properties | ((row: R) => Properties);
  /** Applies this css to each cell in the row. */
  cellCss?: Properties | ((row: R) => Properties);
  /** Renders the cell element, i.e. a link to get whole-row links. */
  renderCell?: RenderCellFn<R>;
  /** Whether the row should be indented (via a style applied to the 1st cell). */
  indent?: 1 | 2;
  /** Whether the row should be a link. */
  rowLink?: (row: R) => string;
  /** Fired when the row is clicked, similar to rowLink but for actions that aren't 'go to this link'. */
  onClick?: (row: GridDataRow<R>) => void;
}

export type GridCellAlignment = "left" | "right" | "center";

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
  /** Whether to indent the cell. */
  indent?: 1 | 2;
  colspan?: number;
  typeScale?: Typography;
  sticky?: "left" | "right";
  bgColor?: Palette;
};

export type MaybeFn<T> = T | (() => T);

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
  /** Whether to pin this sort to the first/last of its parent's children. */
  pin?: "first" | "last";
} & DiscriminateUnion<R, "kind", R["kind"]>;

/** Completely static look & feel, i.e. nothing that is based on row kinds/content. */
export interface GridStyle {
  /** Applied to the base div element. */
  rootCss?: Properties;
  /** Adds specified number as pixels of spacing between the header and body of the table */
  afterHeaderSpacing?: number;
  /** Applied with the owl operator between rows for rendering border lines. */
  betweenRowsCss?: Properties;
  /** Applied to the first non-header row, i.e. if you want to cancel out `betweenRowsCss`. */
  firstNonHeaderRowCss?: Properties;
  /** Applied to all cell divs (via a selector off the base div). */
  cellCss?: Properties;
  /**
   * Applied to the header row divs.
   *
   * NOTE `as=virtual`: When using a virtual table with the goal of adding space
   * between the header and the first row use `firstNonHeaderRowCss` with a
   * margin-top instead. Using `headerCellCss` will not work since the header
   * rows are wrapper with Chrome rows.
   */
  headerCellCss?: Properties;
  /** Applied to the first cell of all rows, i.e. for table-wide padding or left-side borders. */
  firstCellCss?: Properties;
  /** Applied to the last cell of all rows, i.e. for table-wide padding or right-side borders. */
  lastCellCss?: Properties;
  /** Applied to a cell div when `indent: 1` is used. */
  indentOneCss?: Properties;
  /** Applied to a cell div when `indent: 2` is used. */
  indentTwoCss?: Properties;
  /** Applied if there is a fallback/overflow message showing. */
  firstRowMessageCss?: Properties;
  /** Applied on hover if a row has a rowLink/onClick set. */
  rowHoverColor?: string;
  /** Styling for our special "nested card" output mode. */
  nestedCards?: NestedCardsStyle;
  /** Default content to put into an empty cell */
  emptyCell?: ReactNode;
  presentationSettings?: Pick<PresentationFieldProps, "borderless" | "typeScale"> &
    Pick<PresentationContextProps, "wrap">;
}

export type NestedCardStyleByKind = Record<string, NestedCardStyle>;

export interface NestedCardsStyle {
  /** Space between each card. */
  spacerPx: number;
  /** Width of the first and last "hidden" columns used to align nested columns. */
  firstLastColumnWidth: number;
  /**
   * Per-kind styling for nested cards (see `cardStyle` if you only need a flat list of cards).
   *
   * Entries are optional, i.e. you can leave out kinds and they won't be wrapped/turned into cards.
   */
  kinds: NestedCardStyleByKind;
}

/**
 * Styles for making cards nested within other cards.
 *
 * Because all of our output renderers (i.e. CSS grid and react-virtuoso) fundamentally need a flat
 * list of elements, to create the look & feel of "nested cards", GridTable creates extra "chrome"
 * elements like open card, close, and card padding.
 */
export interface NestedCardStyle {
  /** The card background color. */
  bgColor: string;
  /** The optional border color, assumes 1px solid if set. */
  bColor?: string;
  /** I.e. 4px border radius. */
  brPx: number;
  /** The left/right padding of the card. */
  pxPx: number;
}

export type RenderAs = "div" | "table" | "virtual";
