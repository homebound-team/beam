import memoizeOne from "memoize-one";
import { Observer } from "mobx-react";
import React, {
  MutableRefObject,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { Components, Virtuoso } from "react-virtuoso";
import { navLink } from "src/components/CssReset";
import { Icon } from "src/components/Icon";
import { Css, Margin, Only, Palette, Properties, px, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";
import tinycolor from "tinycolor2";

/** A helper for making `Row` type aliases of simple/flat tables that are just header + data. */
export type SimpleHeaderAndDataOf<T> = { kind: "header" } | ({ kind: "data" } & T);

/**
 * A helper for making `Row` type aliases of simple/flat tables that are just header + data.
 *
 * Unlike `SimpleHeaderAndDataOf`, we keep `T` in a separate `data`, which is useful
 * when rows are mobx proxies and we need proxy accesses to happen within the column
 * rendering.
 */
export type SimpleHeaderAndDataWith<T> =
  | { kind: "header" }
  // We put `id` here so that GridColumn can match against `extends { data, id }`,
  // kinda looks like we should combine Row and GridDataRow, i.e. Rows always have ids,
  // they already have kinds, and need to have ids when passed to rows anyway...
  | { kind: "data"; data: T; id: string };

/** A const for a marker header row. */
export const simpleHeader = { kind: "header" as const, id: "header" };

export function simpleRows<T extends { id: string }, R extends { kind: "header" | "data" }>(
  data: T[],
): GridDataRow<R>[] {
  // @ts-ignore Not sure why this doesn't type-check, something esoteric with the DiscriminateUnion type
  return [simpleHeader, ...data.map((c) => ({ kind: "data" as const, ...c }))];
}

/** Like `simpleRows` but for `SimpleHeaderAndDataWith`. */
export function simpleDataRows<T extends { id: string }, R extends { kind: "header" | "data" }>(
  data: T[],
): GridDataRow<R>[] {
  // @ts-ignore Not sure why this doesn't type-check, something esoteric with the DiscriminateUnion type
  return [simpleHeader, ...data.map((data) => ({ kind: "data" as const, data }))];
}

// function createSimpleHeaderAndRows<D extends { id: string }>(
//   dataFn: (q: TeamMembersQuery) => GridDataRow<SimpleHeaderAndDataOf<D>>[],
// ): (data: TeamMembersQuery) => GridDataRow<SimpleHeaderAndDataOf<D>>[] {
//   return data => [simpleHeader, ...(dataFn(data) || []).map(row => ({ kind: "data" as const, ...row }))];
// }

type SortFlags<S> = [S, Direction];

export type Kinded = { kind: string };

export type GridTableXss = Xss<Margin>;

export type Direction = "ASC" | "DESC";

/** Completely static look & feel, i.e. nothing that is based on row kinds/content. */
interface GridStyle {
  /** Applied to the base div element. */
  rootCss: Properties;
  /** Applied with the owl operator between rows for rendering border lines. */
  betweenRowsCss: Properties;
  /** Applied to all cell divs (via a selector off the base div). */
  cellCss: Properties;
  /** Applied to the header (really first) row div. */
  headerCellCss: Properties;
  /** Applied if there is a fallback/overflow message showing. */
  firstRowMessageCss: Properties;
  /** Applied on hover if a row has a rowLink/onClick set. */
  rowHoverColor: string;
}

/** Our original table look & feel/style. */
export let defaultStyle: GridStyle = {
  rootCss: {},
  betweenRowsCss: Css.bt.bGray400.$,
  cellCss: Css.py2.px3.$,
  // Use h100 so that all cells are the same height when scrolled; set bgWhite for when we're laid over other rows.
  headerCellCss: Css.selfEnd.nowrap.py1.bgGray200.h100.itemsEnd.$,
  firstRowMessageCss: Css.px1.py2.$,
  rowHoverColor: Palette.Gray200,
};

/** Tightens up the padding of rows, great for rows that have form elements in them. */
export const condensedStyle: GridStyle = {
  ...defaultStyle,
  cellCss: Css.itemsCenter.p(px(6)).$,
  rootCss: Css.xs.$,
};

/** Configures the default/app-wide GridStyle. */
export function setDefaultStyle(style: GridStyle): void {
  defaultStyle = style;
}

type RenderAs = "div" | "table" | "virtual";

type RowTuple<R extends Kinded> = [GridDataRow<R>, string[], ReactElement, Array<ReactNode | GridCellContent>];

export interface GridTableProps<R extends Kinded, S, X> {
  id?: string;
  /**
   * The HTML used to create the table.
   *
   * By default a `div` will be used with CSS grid styles, but `table` tag can be used
   * with limited functionality but better multi-page printing/page break support.
   *
   * When using `table`, the column width and alignment is only supported using
   * px values.
   *
   * @example
   *  { header: "Name", data: ({ name }) => name, w: "75px", align: "right" }
   */
  as?: RenderAs;
  /** The column definitions i.e. how each column should render each row kind. */
  columns: GridColumn<R, S>[];
  /** The rows of data (including any header/footer rows), to be rendered by the column definitions. */
  rows: GridDataRow<R>[];
  /** Optional row-kind-level styling / behavior like onClick/rowLinks. */
  rowStyles?: GridRowStyles<R>;
  /** Allow looking up prev/next of a row i.e. for SuperDrawer navigation. */
  rowLookup?: MutableRefObject<GridRowLookup<R> | undefined>;
  /** Whether the header row should be sticky. */
  stickyHeader?: boolean;
  stickyOffset?: string;
  sorting?: "client-side" | "server-side";
  /** The current sort by value + direction (if server-side sorting). */
  sort?: [S, Direction];
  /** Callback for when the column is sorted (if server-side sorting). */
  onSort?: (orderBy: S, direction: Direction) => void;
  /** Shown in the first row slot, if there are no rows to show, i.e. 'No rows found'. */
  fallbackMessage?: string;
  /** Shown in the first row, kinda-like the fallbackMessage, but shown even if there are rows as well. */
  infoMessage?: string;
  /** Applies a client-side filter to rows, using either it's text value or `GridCellContent.value`. */
  filter?: string;
  /** Caps the client-side filter to a max number of rows. */
  filterMaxRows?: number;
  /** Accepts the number of filtered rows (based on `filter`), for the caller to observe and display if they want. */
  setRowCount?: (rowCount: number) => void;
  /** Sets the rows to be wrapped by mobx observers. */
  observeRows?: boolean;
  /** A combination of CSS settings to set the static look & feel (vs. rowStyles which is per-row styling). */
  style?: GridStyle;
  xss?: X;
  /**
   * If provided, collapsed rows on the table persists when the page is reloaded.
   *
   * This key should generally be unique to the page it's on, i.e. `specsTable_p:1_precon` would
   *  be the collapsed state for project `p:1`'s precon stage specs & selections table.
   */
  persistCollapse?: string;
}

/**
 * Renders data in our table layout.
 *
 * Tables are essentially a matrix of columns and rows, and this `GridTable` API is setup
 * such that:
 *
 * - Rows are mostly data, tagged with a given `kind`
 *   - I.e. this handles tables with nested/non-homogeneous rows because you can have a
 *     row with `kind: "parent"` and another with `kind: "child"`
 * - Columns are mostly rendering logic
 *   - I.e. each column defines it's behavior for each given row `kind`
 *
 * In a kind of cute way, headers are not modeled specially, i.e. they are just another
 * row `kind` along with the data rows. (Admittedly, out of pragmatism, we do apply some
 * special styling to the row that uses `kind: "header"`.)
 */
export function GridTable<R extends Kinded, S = {}, X extends Only<GridTableXss, X> = {}>(
  props: GridTableProps<R, S, X>,
) {
  const {
    id = "grid-table",
    as = "div",
    columns,
    rows,
    style = defaultStyle,
    rowStyles,
    stickyHeader = false,
    stickyOffset = "0",
    xss,
    sorting,
    sort,
    onSort,
    filter,
    filterMaxRows,
    fallbackMessage = "No rows found.",
    infoMessage,
    setRowCount,
    observeRows,
    persistCollapse,
  } = props;

  const [collapsedIds, toggleCollapsedId] = useToggleIds(rows, persistCollapse);

  const [sortFlags, setSortValue] = useSortFlags<R, S>(columns, sort, onSort);
  const maybeSorted = useMemo(() => {
    if (sorting === "client-side" && sortFlags) {
      // If using client-side sort, the sortFlags use S = number
      return sortRows(columns, rows, sorting, (sortFlags as any) as SortFlags<number>);
    }
    return rows;
  }, [columns, rows, sorting, sortFlags]);
  const noData = !rows.some((row) => row.kind !== "header");

  // For each row, keep it's ReactElement (React.memo'd) + its filter values, so we can re-filter w/o re-evaluating this useMemo.
  const allRows: RowTuple<R>[] = useMemo(() => {
    return maybeSorted.map((row) => {
      // We only pass sortProps to header rows, b/c non-headers rows shouldn't have to re-render on sorting
      // changes, and so by not passing the sortProps, it means the data rows' React.memo will still cache them.
      const sortProps = row.kind === "header" ? { sorting, sortFlags, setSortValue } : {};
      // We only pass `isCollapsed` as a prop so that the row only re-renders when it itself has
      // changed from collapsed/non-collapsed, and not other row's entering/leaving collapsedIds.
      // Note that we do memoized on toggleCollapsedId, but it's stable thanks to useToggleIds.
      const isCollapsed = collapsedIds.includes(row.id);
      const RowComponent = observeRows ? ObservedGridRow : MemoizedGridRow;
      const rowElement = (
        <RowComponent<R, S>
          key={`${row.kind}-${row.id}`}
          {...{
            as,
            columns,
            row,
            style,
            rowStyles,
            stickyHeader,
            stickyOffset,
            isCollapsed,
            toggleCollapsedId,
            ...sortProps,
            persistCollapse,
          }}
        />
      );
      const filterValues = columns.map((c) => applyRowFn(c, row));
      return [row, row.parentIds || [], rowElement, filterValues];
    });
  }, [
    as,
    maybeSorted,
    columns,
    style,
    rowStyles,
    setSortValue,
    sortFlags,
    sorting,
    stickyHeader,
    stickyOffset,
    collapsedIds,
    toggleCollapsedId,
    observeRows,
    persistCollapse,
  ]);

  // Split out the header rows from the data rows so that we can put an `infoMessage` in between them (if needed).
  const headerRows = allRows.filter(([row]) => row.kind === "header");

  // Break up "foo bar" into `[foo, bar]` and a row must match both `foo` and `bar`
  const filters = (filter && filter.split(/ +/)) || [];
  let filteredRows = allRows.filter(([row, parentIds, , rowValues]) => {
    const notHeader = row.kind !== "header";
    const passesCollapsed = !parentIds.some((id) => collapsedIds.includes(id));
    const passesFilter =
      filters.length === 0 ||
      filters.every((filter) => rowValues.some((maybeContent) => matchesFilter(maybeContent, filter)));
    return notHeader && passesFilter && passesCollapsed;
  });

  let tooManyClientSideRows = false;
  if (filterMaxRows && filteredRows.length > filterMaxRows) {
    tooManyClientSideRows = true;
    filteredRows = filteredRows.slice(0, filterMaxRows);
  }

  // Push back to the caller a way to ask us where a row is.
  const { rowLookup } = props;
  if (rowLookup) {
    // Refs are cheap to assign to, so we don't bother doing this in a useEffect
    rowLookup.current = {
      currentList() {
        return filteredRows.map((r) => r[0]);
      },
      lookup(row) {
        const rows = filteredRows.map((r) => r[0]);
        // Ensure we have `result.kind = {}` for each kind
        const result: any = Object.fromEntries(getKinds(columns).map((kind) => [kind, {}]));
        // This is an admittedly cute/fancy scan, instead of just `rows.findIndex`, but
        // we do it this way so that we can do kind-aware prev/next detection.
        let key: "prev" | "next" = "prev";
        for (let i = 0; i < rows.length; i++) {
          const each = rows[i];
          // Flip from prev to next when we find it
          if (each.kind === row.kind && each.id === row.id) {
            key = "next";
          } else {
            if (key === "prev") {
              // prev always overwrites what was there before
              result[key] = each;
              result[each.kind][key] = each;
            } else {
              // next only writes first seen
              result[key] ??= each;
              result[each.kind][key] ??= each;
            }
          }
        }
        return result;
      },
    };
  }

  useEffect(() => {
    setRowCount && filteredRows?.length !== undefined && setRowCount(filteredRows.length);
  }, [filteredRows?.length, setRowCount]);

  const firstRowMessage =
    (noData && fallbackMessage) || (tooManyClientSideRows && "Hiding some rows, use filter...") || infoMessage;

  return renders[as](style, id, columns, headerRows, filteredRows, firstRowMessage, stickyHeader, xss);
}

// Determine which HTML element to use to build the GridTable
const renders: Record<RenderAs, typeof renderTable> = {
  table: renderTable,
  div: renderCssGrid,
  virtual: renderVirtual,
};

function renderCssGrid<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumn<R>[],
  headerRows: RowTuple<R>[],
  filteredRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
): ReactElement {
  const gridTemplateColumns = columns
    // Default to auto, but use `c.w` as a fr if numeric or else `c.w` as-if if a string
    .map((c) => (typeof c.w === "string" ? c.w : c.w !== undefined ? `${c.w}fr` : "auto"))
    .join(" ");
  return (
    <div
      css={{
        ...Css.dg.add({ gridTemplateColumns }).$,
        ...Css
          // Apply the between-row styling with `div + div > *` so that we don't have to have conditional
          // `if !lastRow add border` CSS applied via JS that would mean the row can't be React.memo'd.
          // The `div + div` is also the "owl operator", i.e. don't apply to the 1st row.
          .addIn("& > div + div > *", style.betweenRowsCss)
          // removes border between header and second row
          .addIn("& > div:nth-of-type(2) > *", Css.add({ borderTopStyle: "none" }).$).$,
        ...style.rootCss,
        ...xss,
      }}
      data-testid={id}
    >
      {headerRows.map(([, , node]) => node)}
      {/* Show an all-column-span info message if it's set. */}
      {firstRowMessage && (
        <div css={Css.add("gridColumn", `${columns.length} span`).$}>
          <div css={{ ...style.firstRowMessageCss }}>{firstRowMessage}</div>
        </div>
      )}
      {filteredRows.map(([, , node]) => node)}
    </div>
  );
}

function renderTable<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumn<R>[],
  headerRows: RowTuple<R>[],
  filteredRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
): ReactElement {
  return (
    <table
      css={{
        ...Css.w100.add("borderCollapse", "collapse").$,
        ...Css.addIn("& > tbody > tr ", style.betweenRowsCss)
          // removes border between header and second row
          .addIn("& > tbody > tr:first-of-type", Css.add({ borderTopStyle: "none" }).$).$,
        ...style.rootCss,
        ...xss,
      }}
      data-testid={id}
    >
      <thead>{headerRows.map(([, , node]) => node)}</thead>
      <tbody>
        {/* Show an all-column-span info message if it's set. */}
        {firstRowMessage && (
          <tr>
            <td colSpan={columns.length} css={{ ...style.firstRowMessageCss }}>
              {firstRowMessage}
            </td>
          </tr>
        )}
        {filteredRows.map(([, , node]) => node)}
      </tbody>
    </table>
  );
}

function renderVirtual<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumn<R>[],
  headerRows: RowTuple<R>[],
  filteredRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
): ReactElement {
  const gridTemplateColumns = columns
    // Default to auto, but use `c.w` as a fr if numeric or else `c.w` as-if if a string
    .map((c) => (typeof c.w === "string" ? c.w : c.w !== undefined ? `${c.w}fr` : "auto"))
    .join(" ");

  return (
    <Virtuoso
      components={{ List: VirtualRoot(style, gridTemplateColumns, id, xss) }}
      // We use display:contents to promote the itemContent out of virtuoso's
      // Item/div wrapper (b/c our GridRow already has it), but that breaks the
      // auto height detection.
      //
      // I've tried to provide a custom Item component, but since it needs to accept
      // a custom ref and `data-*` props, and b/c RowTuple has already invoked
      // the GridRow function, we can't easily combine the two.
      fixedItemHeight={56}
      topItemCount={stickyHeader ? 1 : 0}
      itemContent={(index) => {
        let i = index;
        if (i < headerRows.length) {
          return headerRows[i][2];
        }
        i -= headerRows.length;
        if (firstRowMessage) {
          if (i === 0) {
            return firstRowMessage;
          }
          i -= 1;
        }
        return filteredRows[i][2];
      }}
      totalCount={headerRows.length + (firstRowMessage ? 1 : 0) + filteredRows.length}
    />
  );
}

// Use memoize to create a single component type for a given set of props. I'm not
// entirely sure this is necessary, but [1] made it seem so. Also xss will probably
// not be memoized.
//
// [1]: https://codesandbox.io/s/github/bvaughn/react-window/tree/master/website/sandboxes/memoized-list-items?file=/index.js
const VirtualRoot = memoizeOne<
  (gs: GridStyle, gridTemplateColumns: string, id: string, xss: any) => Components["List"]
>((gs, gridTemplateColumns, id, xss) => {
  return React.forwardRef(({ style, children }, ref) => {
    // This re-renders each time we have new children in the view port
    return (
      <div
        ref={ref}
        style={style}
        css={{
          ...Css.dg.add({ gridTemplateColumns }).$,
          ...Css
            // Apply the between-row styling with `div + div > *` so that we don't have to have conditional
            // `if !lastRow add border` CSS applied via JS that would mean the row can't be React.memo'd.
            // The `div + div` is also the "owl operator", i.e. don't apply to the 1st row.
            .addIn("& > div + div > div > *", gs.betweenRowsCss)
            // Flatten out the Item
            .addIn("& > div", Css.display("contents").$).$,
          ...gs.rootCss,
          ...xss,
        }}
        data-testid={id}
      >
        {children}
      </div>
    );
  });
});

/**
 * Given an ADT of type T, performs a look up and returns the type of kind K.
 *
 * See https://stackoverflow.com/a/50125960/355031
 */
type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;

/** Defines how a single column will render each given row `kind` in `R`. */
export type GridColumn<R extends Kinded, S = {}> = {
  [P in R["kind"]]:
    | string
    | (DiscriminateUnion<R, "kind", P> extends { data: infer D; id: infer I }
        ? (data: D, id: I) => ReactNode | GridCellContent
        : (row: DiscriminateUnion<R, "kind", P>) => ReactNode | GridCellContent);
} & {
  /** The column's grid column width, defaults to `auto`. */
  w?: number | string;
  /** The column's default alignment for each cell. */
  align?: GridCellAlignment;
  /** Whether the column can be sorted (if client-side sorting). */
  sort?: boolean;
  /** This column's sort by value (if server-side sorting). */
  sortValue?: S;
};

/** Allows rendering a specific cell. */
type RenderCellFn<R extends Kinded> = (
  idx: number,
  css: Properties,
  content: ReactNode,
  row: R,
  rowStyle: RowStyle<R> | undefined,
) => ReactNode;

/** Defines row-specific styling for each given row `kind` in `R` */
export type GridRowStyles<R extends Kinded> = {
  [P in R["kind"]]: RowStyle<DiscriminateUnion<R, "kind", P>>;
};

export interface RowStyle<R extends Kinded> {
  /** Applies this css to the wrapper row, i.e. for row-level hovers. */
  rowCss?: Properties | ((row: R) => Properties);
  /** Applies this css to each cell in the row. */
  cellCss?: Properties | ((row: R) => Properties);
  /** Renders the cell element, i.e. a link to get whole-row links. */
  renderCell?: RenderCellFn<R>;
  /** Whether the row should be indented (via a style applied to the 1st cell). */
  indent?: "1" | "2";
  /** Whether the row should be a link. */
  rowLink?: (row: R) => string;
  /** Fired when the row is clicked, similar to rowLink but for actions that aren't 'go to this link'. */
  onClick?: (row: GridDataRow<R>) => void;
}

/** Allows a caller to ask for the currently shown rows, given the current sorting/filtering. */
export interface GridRowLookup<R extends Kinded> {
  /** Returns both the immediate next/prev rows, as well as `[kind].next/prev` values, ignoring headers. */
  lookup(
    row: GridDataRow<R>,
  ): NextPrev<R> &
    {
      [P in R["kind"]]: NextPrev<DiscriminateUnion<R, "kind", P>>;
    };

  /** Returns the list of currently filtered/sorted rows, without headers. */
  currentList(): readonly GridDataRow<R>[];
}

interface NextPrev<R extends Kinded> {
  next: GridDataRow<R> | undefined;
  prev: GridDataRow<R> | undefined;
}

function getIndentationCss<R extends Kinded>(rowStyle: RowStyle<R> | undefined): Properties {
  const indent = rowStyle?.indent;
  return Css.pl(indent === "2" ? 7 : indent === "1" ? 4 : 1).$;
}

export type GridCellAlignment = "left" | "right" | "center";

export type GridCellContent = { content: ReactNode; alignment?: GridCellAlignment; value?: number | string | Date };

/**
 * The data for any row in the table, marked by `kind` so that each column knows how to render it.
 *
 * This should contain very little presentation data, i.e. the bulk of the keys should be data for
 * the given `kind: ...` of each row (which we pull in via the `DiscriminateUnion` intersection).
 *
 * The presentation concerns instead live in each GridColumn definition, which formats a given
 * data row for its column.
 */
export type GridDataRow<R extends Kinded> = {
  kind: R["kind"];
  /** Combined with the `kind` to determine a table wide React key. */
  id: string;
  /** A list of parent/grand-parent ids for collapsing parent/child rows. */
  parentIds?: string[];
} & DiscriminateUnion<R, "kind", R["kind"]>;

interface GridRowProps<R extends Kinded, S> {
  as: RenderAs;
  columns: GridColumn<R>[];
  row: GridDataRow<R>;
  style: GridStyle;
  rowStyles: GridRowStyles<R> | undefined;
  stickyHeader: boolean;
  stickyOffset: string;
  sorting?: string;
  sortFlags?: SortFlags<S>;
  setSortValue?: (value: S) => void;
  isCollapsed: boolean;
  toggleCollapsedId: (id: string) => void;
}

// We extract GridRow to its own mini-component primarily so we can React.memo'ize it.
function GridRow<R extends Kinded, S>(props: GridRowProps<R, S>) {
  const {
    as,
    columns,
    row,
    style,
    rowStyles,
    stickyHeader,
    stickyOffset,
    sorting,
    sortFlags,
    setSortValue,
    isCollapsed,
    toggleCollapsedId,
  } = props;

  // We treat the "header" kind as special for "good defaults" styling
  const isHeader = row.kind === "header";
  const rowStyle = rowStyles?.[row.kind];

  const rowStyleCellCss = maybeApplyFunction(row, rowStyle?.cellCss);
  const rowCss = {
    // We add a display-contents so that we can have "row-level" div elements in our
    // DOM structure. I.e. grid is normally root-element > cell-elements, but we want
    // root-element > row-element > cell-elements, so that we can have a hook for
    // hovers and styling. In theory this would change with subgrids.
    // Only enable when using div as elements
    ...(as === "table" ? {} : Css.display("contents").$),
    ...((rowStyle?.rowLink || rowStyle?.onClick) && {
      // Even though backgroundColor is set on the cellCss (due to display: content), the hover target is the row.
      "&:hover > *": Css.cursorPointer.bgColor(maybeDarken(rowStyleCellCss?.backgroundColor, style.rowHoverColor)).$,
    }),
    ...maybeApplyFunction(row, rowStyle?.rowCss),
  };

  const Row = as === "table" ? "tr" : "div";

  const div = (
    <Row css={rowCss}>
      {columns.map((column, idx) => {
        const maybeContent = applyRowFn(column, row);

        const canSortColumn =
          (sorting === "client-side" && column.sort !== false) || (sorting === "server-side" && !!column.sortValue);
        const content = maybeAddHeaderStyling(maybeContent, isHeader, canSortColumn);

        // Note that it seems expensive to calc a per-cell class name/CSS-in-JS output,
        // vs. setting global/table-wide CSS like `style.cellCss` on the root grid div with
        // a few descendent selectors. However, that approach means the root grid-applied
        // CSS has a high-specificity and so its harder for per-page/per-cell business logic
        // to override it. So, we just calc the combined table-wide+per-cell-overridden CSS here,
        // in a very CSS-in-JS idiomatic manner.
        //
        // In practice we've not seen any performance issues with this from our "large but
        // not Google spreadsheets" tables.
        const cellCss = {
          // Adding display flex so we can align content within the cells
          ...Css.df.$,
          // Apply any static/all-cell styling
          ...style.cellCss,
          ...(isHeader && style.headerCellCss),
          ...getJustification(column, maybeContent, as),
          ...(idx === 0 && getIndentationCss(rowStyle)),
          ...(isHeader && stickyHeader && Css.sticky.top(stickyOffset).$),
          ...rowStyleCellCss,
        };

        const renderFn: RenderCellFn<any> =
          rowStyle?.renderCell || rowStyle?.rowLink
            ? rowLinkRenderFn(as)
            : isHeader
            ? headerRenderFn(columns, column, sortFlags, setSortValue, as)
            : rowStyle?.onClick
            ? rowClickRenderFn(as)
            : defaultRenderFn(as);

        return renderFn(idx, cellCss, content, row, rowStyle);
      })}
    </Row>
  );

  // Because of useToggleIds, this provider should basically never trigger a re-render, which is
  // good because we don't want the context to change and re-render every row just because some
  // other unrelated rows have collapsed/uncollapsed.
  const collapseContext = useMemo<GridCollapseContextProps>(
    () => ({
      isCollapsed,
      toggleCollapse: () => toggleCollapsedId(row.id),
    }),
    [isCollapsed, toggleCollapsedId, row],
  );
  return <GridCollapseContext.Provider value={collapseContext}>{div}</GridCollapseContext.Provider>;
}

// Fix to work with generics, see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-656596623
const MemoizedGridRow = React.memo(GridRow) as typeof GridRow;

/** Wraps a mobx Observer around the row's rendering/evaluation, so that it will be reactive. */
const ObservedGridRow = React.memo((props: GridRowProps<any, any>) => (
  <Observer>
    {() => {
      // Invoke this just as a regular function so that Observer sees the proxy access's
      return GridRow(props);
    }}
  </Observer>
));

/** If a column def return just string text for a given row, apply some default styling. */
function maybeAddHeaderStyling(content: ReactNode | GridCellContent, isHeader: boolean, sorting: boolean): ReactNode {
  if (typeof content === "string" && isHeader) {
    return sorting ? <SortHeader content={content} /> : <div>{content}</div>;
  } else if (isContentAndSettings(content)) {
    return content.content;
  }
  return content;
}

function isContentAndSettings(content: ReactNode | GridCellContent): content is GridCellContent {
  return typeof content === "object" && !!content && "content" in content;
}

/** Return the content for a given column def applied to a given row. */
function applyRowFn<R extends Kinded>(column: GridColumn<R>, row: GridDataRow<R>): ReactNode | GridCellContent {
  // Usually this is a function to apply against the row, but sometimes it's a hard-coded value, i.e. for headers
  const maybeContent = column[row.kind];
  if (typeof maybeContent === "function") {
    if ("data" in row && "id" in row) {
      // Auto-destructure data
      return (maybeContent as Function)((row as any)["data"], (row as any)["id"]);
    } else {
      return (maybeContent as Function)(row);
    }
  } else {
    return maybeContent;
  }
}

/** Renders our default cell element, i.e. if no row links and no custom renderCell are used. */
const defaultRenderFn: (as: RenderAs) => RenderCellFn<any> = (as: RenderAs) => (key, css, content) => {
  const Row = as === "table" ? "td" : "div";
  return (
    <Row key={key} css={{ ...css, ...tableRowStyles(as) }}>
      {content}
    </Row>
  );
};

/**
 * Provides the sorting settings to headers.
 *
 * This is broken out into it's own context (i.e. separate from `GridCollapseContextProps`)
 * so that we can have sort changes only re-render the header row, and not trigger a re-render
 * of every row in the table.
 */
type GridSortContextProps = { sorted: "ASC" | "DESC" | undefined; toggleSort(): void };

export const GridSortContext = React.createContext<GridSortContextProps>({
  sorted: undefined,
  toggleSort: () => {},
});

/**
 * Provides each row access to its `collapsed` current state and toggle.
 *
 * Calling `toggleCollapse` will keep the row itself showing, but will hide any
 * children rows (specifically those that have this row's `id` in their `parentIds`
 * prop).
 */
type GridCollapseContextProps = { isCollapsed: boolean; toggleCollapse(): void };

export const GridCollapseContext = React.createContext<GridCollapseContextProps>({
  isCollapsed: false,
  toggleCollapse: () => {},
});

/** Sets up the `GridContext` so that header cells can access the current sort settings. */
const headerRenderFn: (
  columns: GridColumn<any>[],
  column: GridColumn<any>,
  sortFlags: SortFlags<any> | undefined,
  setSortValue: Function | undefined,
  as: RenderAs,
) => RenderCellFn<any> = (columns, column, sortFlags, setSortValue, as) => (key, css, content) => {
  const [currentValue, direction] = sortFlags || [];
  const newValue = column.sortValue || columns.indexOf(column);
  const context: GridSortContextProps = {
    sorted: newValue === currentValue ? direction : undefined,
    toggleSort: () => setSortValue!(newValue),
  };
  const Row = as === "table" ? "th" : "div";
  return (
    <GridSortContext.Provider key={key} value={context}>
      <Row css={{ ...css, ...tableRowStyles(as, column) }}>{content}</Row>
    </GridSortContext.Provider>
  );
};

/** Renders a cell element when a row link is in play. */
const rowLinkRenderFn: (as: RenderAs) => RenderCellFn<any> = (as: RenderAs) => (key, css, content, row, rowStyle) => {
  const to = rowStyle!.rowLink!(row);
  if (as === "table") {
    return (
      <td key={key} css={{ ...css, ...tableRowStyles(as) }}>
        <Link to={to} css={Css.noUnderline.color("unset").db.$} className={navLink}>
          {content}
        </Link>
      </td>
    );
  }
  return (
    <Link key={key} to={to} css={{ ...Css.noUnderline.color("unset").$, ...css }} className={navLink}>
      {content}
    </Link>
  );
};

/** Renders a cell that will fire the RowStyle.onClick. */
const rowClickRenderFn: (as: RenderAs) => RenderCellFn<any> = (as: RenderAs) => (key, css, content, row, rowStyle) => {
  const Row = as === "table" ? "tr" : "div";
  return (
    <Row {...{ key }} css={{ ...css, ...tableRowStyles(as) }} onClick={() => rowStyle!.onClick!(row)}>
      {content}
    </Row>
  );
};

const alignmentToJustify: Record<GridCellAlignment, Properties["justifyContent"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};
const alignmentToTextAlign: Record<GridCellAlignment, Properties["textAlign"]> = {
  left: "left",
  center: "center",
  right: "right",
};

// For alignment, use: 1) user-specified, else 2) center if non-1st header, else 3) left.
function getJustification(column: GridColumn<any>, maybeContent: ReactNode | GridCellContent, as: RenderAs) {
  const alignment = (isContentAndSettings(maybeContent) && maybeContent.alignment) || column.align || "left";
  if (as === "table") {
    return Css.add("textAlign", alignmentToTextAlign[alignment]).$;
  }
  return Css.justify(alignmentToJustify[alignment]).$;
}

// TODO This is very WIP / proof-of-concept and needs flushed out a lot more to handle nested batches.
function sortRows<R extends Kinded>(
  columns: GridColumn<R>[],
  rows: GridDataRow<R>[],
  sorting: "client-side" | "server-side" | undefined,
  sortFlags: SortFlags<number>,
) {
  const sorted: GridDataRow<R>[] = [];
  let currentKind: R["kind"] | undefined = undefined;
  let currentBatch: GridDataRow<R>[] = [];

  for (const row of rows) {
    if (row.kind === "header") {
      sorted.push(row);
    } else if (row.kind === currentKind) {
      currentBatch.push(row);
    } else {
      sortBatch(columns, currentBatch, sortFlags);
      sorted.push(...currentBatch);
      currentBatch = [row];
      currentKind = row.kind;
    }
  }

  // Flush last batch
  sortBatch(columns, currentBatch, sortFlags);
  sorted.push(...currentBatch);

  return sorted;
}

function sortBatch<R extends Kinded>(
  columns: GridColumn<R>[],
  batch: GridDataRow<R>[],
  sortFlags: SortFlags<number>,
): void {
  // When client-side sort, the sort value is the column index
  const [value, direction] = sortFlags;
  const column = columns[value];
  const invert = direction === "DESC";
  batch.sort((a, b) => {
    const v1 = maybeValue(applyRowFn(column, a));
    const v2 = maybeValue(applyRowFn(column, b));
    const v1e = v1 === null || v1 === undefined;
    const v2e = v2 === null || v2 === undefined;
    if ((v1e && v2e) || v1 === v2) {
      return 0;
    } else if (v1e || v1 < v2) {
      return invert ? 1 : -1;
    } else if (v2e || v1 > v2) {
      return invert ? -1 : 1;
    }
    return 0;
  });
}

function maybeValue(value: ReactNode | GridCellContent): any {
  return value && typeof value === "object" && "value" in value ? value.value : value;
}

/** Small custom hook that wraps the "setSortColumn inverts the current sort" logic. */
function useSortFlags<R extends Kinded, S>(
  columns: GridColumn<R, S>[],
  sort: [S, Direction] | undefined,
  onSort: ((sortValue: S, direction: Direction) => void) | undefined,
): [SortFlags<S> | undefined, (value: S) => void] {
  // If we're server-side sorting, use the caller's `sort` prop to initialize our internal `useState`.
  // Note that after this initialization, our `setSortValue` will keep both the caller's state
  // and our internal sortFlags state in sync. As long as the caller doesn't change the sort prop
  // directly.
  const [sortFlags, setSortFlags] = useState<SortFlags<S> | undefined>(sort);

  // Make a custom setSortValue that is useState-like but contains the invert-if-same-column-clicked-twice logic.
  const setSortValue = useCallback(
    (value: S) => {
      const [currentValue, currentDirection] = sortFlags || [];
      const [newValue, newDirection] =
        value === currentValue
          ? [currentValue, currentDirection === "ASC" ? ("DESC" as const) : ("ASC" as const)]
          : [value, "ASC" as const];
      setSortFlags([newValue, newDirection]);
      if (onSort) {
        // The sortValue! should be safe because we check it before display the sort icon
        onSort(newValue, newDirection);
      }
    },
    [sortFlags, setSortFlags, onSort],
  );

  return [sortFlags, setSortValue];
}

export function SortHeader(props: { content: string; xss?: Properties }) {
  const { content, xss } = props;
  const { sorted, toggleSort } = useContext(GridSortContext);
  const tid = useTestIds(props, "sortHeader");
  return (
    <div {...tid} css={{ ...Css.df.itemsCenter.cursorPointer.selectNone.$, ...xss }} onClick={toggleSort}>
      {content}
      &nbsp;
      {sorted === "ASC" && <Icon icon="sortUp" inc={2} {...tid.icon} />}
      {sorted === "DESC" && <Icon icon="sortDown" inc={2} {...tid.icon} />}
    </div>
  );
}

function maybeApplyFunction<T>(
  row: T,
  maybeFn: Properties | ((row: T) => Properties) | undefined,
): Properties | undefined {
  return typeof maybeFn === "function" ? maybeFn(row) : maybeFn;
}

export function matchesFilter(maybeContent: ReactNode | GridCellContent, filter: string): boolean {
  let value = maybeValue(maybeContent);
  if (typeof value === "string") {
    return value.toLowerCase().includes(filter.toLowerCase());
  } else if (typeof value === "number") {
    return Number(filter) === value;
  }
  return false;
}

function maybeDarken(color: string | undefined, defaultColor: string): string {
  return color ? tinycolor(color).darken(4).toString() : defaultColor;
}

// Get the rows that are already in the toggled state, so we can keep them toggled
function getCollapsedRows(persistCollapse: string | undefined): string[] {
  if (!persistCollapse) return [];
  const collapsedGridRowIds = localStorage.getItem(persistCollapse);
  return collapsedGridRowIds ? JSON.parse(collapsedGridRowIds) : [];
}

/**
 * A custom hook to manage a list of ids.
 *
 * What's special about this hook is that we manage a stable identity
 * for the `toggleId` function, so that rows that have _not_ toggled
 * themselves on/off will have an unchanged callback and so not be
 * re-rendered.
 *
 * That said, when they do trigger a `toggleId`, the stable/"stale" callback
 * function should see/update the latest list of values, which is not possible with a
 * traditional `useState` hook because it captures the original/stale list identity.
 */
function useToggleIds(rows: GridDataRow<Kinded>[], persistCollapse: string | undefined) {
  // Make a list that we will only mutate, so that our callbacks have a stable identity.
  const [collapsedIds] = useState<string[]>(getCollapsedRows(persistCollapse));
  // Use this to trigger the component to re-render even though we're not calling `setList`
  const [tick, setTick] = useState<string>("");

  // Create the stable `toggleId`, i.e. we are purposefully passing an (almost) empty dep list
  const toggleId = useCallback(
    (id: string) => {
      // We have different behavior when going from expand/collapse all.
      if (id === "header") {
        const isAllCollapsed = collapsedIds[0] === "header";
        collapsedIds.splice(0, collapsedIds.length);
        if (isAllCollapsed) {
          // Expand all means keep `collapsedIds` empty
        } else {
          // Otherwise push `header` on the list as a hint that we're in the collapsed-all state
          collapsedIds.push("header");
          // Find all non-leaf nodes
          const parentIds = new Set<string>();
          rows.forEach((r) => {
            (r.parentIds || []).forEach((id) => parentIds.add(id));
          });
          // And then mark all parent rows as collapsed.
          collapsedIds.push(...parentIds);
        }
      } else {
        // This is the regular/non-header behavior to just add/remove the individual row id
        const i = collapsedIds.indexOf(id);
        if (i === -1) {
          collapsedIds.push(id);
        } else {
          collapsedIds.splice(i, 1);
        }
      }
      if (persistCollapse) {
        localStorage.setItem(persistCollapse, JSON.stringify(collapsedIds));
      }
      // Trigger a re-render
      setTick(collapsedIds.join(","));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows],
  );

  // Return a copy of the list, b/c we want external useMemos that do explicitly use the
  // entire list as a dep to re-render whenever the list is changed (which they need to
  // see as new list identity).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const copy = useMemo(() => [...collapsedIds], [tick, collapsedIds]);
  return [copy, toggleId] as const;
}

/**
 * Decorates a list of `GridColumn`s to `Observer`-ize their render methods.
 *
 * This is useful when your rows have mobx observables/proxies as their data, and you want
 * the GridTable cells to re-render as those observables change, without having to add
 * the `Observer` component + function boilerplate in each cell.
 */
export function observableColumns<T extends Kinded>(cols: GridColumn<T>[]): GridColumn<T>[] {
  return cols.map((col) => {
    return Object.fromEntries(
      Object.entries(col).map(([key, value]) => {
        // Note that currently we're guessing that all functions are the kind() render
        // functions and any "setting" flags, i.e. the width, sortValue, are not functions.
        // If the heuristic eventually doesn't work, we could just hard-code all of the known
        // GridColumn setting keys.
        if (typeof value === "function") {
          return [key, (row: any) => <Observer>{() => value(row)}</Observer>];
        }
        return [key, value];
      }),
    );
  }) as any;
}

function getKinds<R extends Kinded>(columns: GridColumn<R>[]): R[] {
  // Use the 1st column to get the runtime list of kinds
  const nonKindKeys = ["w", "sort", "sortValue", "align"];
  return Object.keys(columns[0] || {}).filter((key) => !nonKindKeys.includes(key)) as any;
}

/** GridTable as Table utility to apply <tr> element override styles */
const tableRowStyles = (as: RenderAs, column?: GridColumn<any>) => {
  const thWidth = column?.w;
  return as === "table"
    ? {
        ...Css.dtc.$,
        ...(thWidth ? Css.w(thWidth).$ : {}),
      }
    : {};
};
