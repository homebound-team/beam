import { fail } from "@homebound/form-state/dist/utils";
import memoizeOne from "memoize-one";
import { Observer } from "mobx-react";
import React, {
  Fragment,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { Components, Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { navLink } from "src/components/CssReset";
import { Icon } from "src/components/Icon";
import { createRowLookup, GridRowLookup } from "src/components/Table/GridRowLookup";
import { Css, Margin, Only, Palette, Properties, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";
import tinycolor from "tinycolor2";

export type Kinded = { kind: string };

export type GridTableXss = Xss<Margin>;

export const ASC = "ASC" as const;
export const DESC = "DESC" as const;
export type Direction = "ASC" | "DESC";

let runningInJest = false;

/** Tells GridTable we're running in Jest, which forces as=virtual to be as=div, to work in jsdom. */
export function setRunningInJest() {
  runningInJest = true;
}

/** Completely static look & feel, i.e. nothing that is based on row kinds/content. */
export interface GridStyle {
  /** Applied to the base div element. */
  rootCss?: Properties;
  /** Applied with the owl operator between rows for rendering border lines. */
  betweenRowsCss?: Properties;
  /** Applied to the first non-header row, i.e. if you want to cancel out `betweenRowsCss`. */
  firstNonHeaderRowCss?: Properties;
  /** Applied to all cell divs (via a selector off the base div). */
  cellCss?: Properties;
  /** Applied to the header (really first) row div. */
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
  nestedCards?: {
    // Map of kind --> card style
    [kind: string]: NestedCardStyle;
  };
}

export interface NestedCardStyle {
  /** The card background color. */
  bgColor: string;
  /** The optional border color, assumes 1px solid if set. */
  bColor?: string;
  /** I.e. 4px border radius. */
  brPx: number;
  /** The left/right padding of the card. */
  pxPx: number;
  /** The y spacing between each card. */
  spacerPx: number;
}

export interface GridTableDefaults {
  style: GridStyle;
  stickyHeader: boolean;
}

/** Our original table look & feel/style. */
export const defaultStyle: GridStyle = {
  rootCss: Css.gray700.$,
  betweenRowsCss: Css.bt.bGray400.$,
  firstNonHeaderRowCss: Css.add({ borderTopStyle: "none" }).$,
  cellCss: Css.py2.px3.$,
  firstCellCss: Css.pl1.$,
  lastCellCss: Css.$,
  indentOneCss: Css.pl4.$,
  indentTwoCss: Css.pl7.$,
  // Use h100 so that all cells are the same height when scrolled; set bgWhite for when we're laid over other rows.
  headerCellCss: Css.asfe.nowrap.py1.bgGray100.h100.aife.$,
  firstRowMessageCss: Css.px1.py2.$,
  rowHoverColor: Palette.Gray200,
};

/** Tightens up the padding of rows, great for rows that have form elements in them. */
export const condensedStyle: GridStyle = {
  ...defaultStyle,
  headerCellCss: Css.bgGray100.tinyEm.$,
  cellCss: Css.aic.sm.py1.px2.$,
  rootCss: Css.dg.gray700.xs.$,
};

/** Renders each row as a card. */
export const cardStyle: GridStyle = {
  ...defaultStyle,
  firstNonHeaderRowCss: Css.mt2.$,
  cellCss: Css.p2.my1.bt.bb.bGray400.$,
  firstCellCss: Css.bl.add({ borderTopLeftRadius: "4px", borderBottomLeftRadius: "4px" }).$,
  lastCellCss: Css.br.add({ borderTopRightRadius: "4px", borderBottomRightRadius: "4px" }).$,
  // Undo the card look & feel for the header
  headerCellCss: {
    ...defaultStyle.headerCellCss,
    ...Css.add({
      border: "none",
      borderRadius: "unset",
    }).p1.m0.xsEm.gray700.$,
  },
};

let defaults: GridTableDefaults = {
  style: defaultStyle,
  stickyHeader: false,
};

/** Configures the default/app-wide GridStyle. */
export function setDefaultStyle(style: GridStyle): void {
  defaults.style = style;
}

/** Configures the default/app-wide GridTable settings. */
export function setGridTableDefaults(opts: Partial<GridTableDefaults>): void {
  defaults = { ...defaults, ...opts };
}

type RenderAs = "div" | "table" | "virtual";

// The row is optional b/c the nested card chrome rows only have ReactElements.
export type RowTuple<R extends Kinded> = [GridDataRow<R> | undefined, ReactElement];

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
      initial?: [S | GridColumn<any>, Direction];
    }
  | {
      on: "server";
      /** The current sort by value + direction (if server-side sorting). */
      value?: [S, Direction];
      /** Callback for when the column is sorted (if server-side sorting). */
      onSort: (orderBy: S, direction: Direction) => void;
    };

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
  sorting?: GridSortConfig<S>;
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
  /**
   * If provided, collapsed rows on the table persists when the page is reloaded.
   *
   * This key should generally be unique to the page it's on, i.e. `specsTable_p:1_precon` would
   *  be the collapsed state for project `p:1`'s precon stage specs & selections table.
   */
  persistCollapse?: string;
  xss?: X;
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
    style = defaults.style,
    rowStyles,
    stickyHeader = defaults.stickyHeader,
    stickyOffset = "0",
    xss,
    sorting,
    filter,
    filterMaxRows,
    fallbackMessage = "No rows found.",
    infoMessage,
    setRowCount,
    observeRows,
    persistCollapse,
  } = props;

  const [collapsedIds, toggleCollapsedId] = useToggleIds(rows, persistCollapse);
  // We only use this in as=virtual mode, but keep this here for rowLookup to use
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  const [sortState, setSortKey] = useSortState<R, S>(columns, sorting);
  // Disclaimer that technically even though this is a useMemo, sortRows is mutating `rows` directly
  const maybeSorted = useMemo(() => {
    if (sorting?.on === "client" && sortState) {
      // If using client-side sort, the sortState use S = number
      sortRows(columns, rows, sortState as any as SortState<number>);
      return rows;
    }
    return rows;
  }, [columns, rows, sorting, sortState]);

  // Filter + flatten + component-ize the sorted rows.
  let [headerRows, filteredRows]: [RowTuple<R>[], RowTuple<R>[]] = useMemo(() => {
    // Break up "foo bar" into `[foo, bar]` and a row must match both `foo` and `bar`
    const filters = (filter && filter.split(/ +/)) || [];

    function makeRowComponent(row: GridDataRow<R>): JSX.Element {
      // We only pass sortState to header rows, b/c non-headers rows shouldn't have to re-render on sorting
      // changes, and so by not passing the sortProps, it means the data rows' React.memo will still cache them.
      const sortProps = row.kind === "header" ? { sorting, sortState, setSortKey } : { sorting };
      // We only pass `isCollapsed` as a prop so that the row only re-renders when it itself has
      // changed from collapsed/non-collapsed, and not other row's entering/leaving collapsedIds.
      // Note that we do memoized on toggleCollapsedId, but it's stable thanks to useToggleIds.
      const isCollapsed = collapsedIds.includes(row.id);
      const RowComponent = observeRows ? ObservedGridRow : MemoizedGridRow;
      return (
        <RowComponent
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
            // TODO: How will this effect with memoization?
            openCards: [...openCards],
            ...sortProps,
          }}
        />
      );
    }

    // Split out the header rows from the data rows so that we can put an `infoMessage` in between them (if needed).
    const headerRows: RowTuple<R>[] = [];
    const filteredRows: RowTuple<R>[] = [];

    // Misc state to track our nested card-ification, i.e. interleaved actual rows + chrome rows
    const nestedCardStyle = style.nestedCards;
    const nestedCards = !!nestedCardStyle;
    let chromeContent: JSX.Element[] = [];
    // A stack of the current cards we're showing
    const openCards: NestedCardStyle[] = [];
    // Take the current buffer of close row(s), spacers, and open row, and creates a single chrome DOM row
    function flushChromeContent(): void {
      filteredRows.push([
        undefined,
        <div css={Css.add({ gridColumn: `span ${columns.length}` }).$}>
          {chromeContent.map((c, i) => (
            <Fragment key={i}>{c}</Fragment>
          ))}
        </div>,
      ]);
      chromeContent = [];
    }

    // Depth-first to filter
    function visit(row: GridDataRow<R>): void {
      if (row.kind === "header") {
        headerRows.push([row, makeRowComponent(row)]);
        return;
      }

      const passesFilter =
        filters.length === 0 ||
        filters.every((filter) =>
          columns.map((c) => applyRowFn(c, row)).some((maybeContent) => matchesFilter(maybeContent, filter)),
        );
      // Even if we don't pass the filter, one of our children might, so we continue on after this check
      if (passesFilter) {
        if (nestedCards) {
          // Maybe make a new chrome
          openCards.push(nestedCardStyle[row.kind] || fail(`no card style for ${row.kind}`));
          chromeContent.push(makeOpenOrCloseCard(openCards, "open"));
          flushChromeContent();
        }
        filteredRows.push([row, makeRowComponent(row)]);
      }

      const isCollapsed = collapsedIds.includes(row.id);
      if (!isCollapsed && row.children) {
        row.children.forEach(visit);
      }

      if (nestedCards) {
        chromeContent.push(makeOpenOrCloseCard(openCards, "close"));
        openCards.pop();
      }
    }

    maybeSorted.forEach(visit);
    flushChromeContent();

    return [headerRows, filteredRows];
  }, [
    as,
    maybeSorted,
    columns,
    filter,
    style,
    rowStyles,
    sorting,
    setSortKey,
    sortState,
    stickyHeader,
    stickyOffset,
    collapsedIds,
    toggleCollapsedId,
    observeRows,
  ]);

  let tooManyClientSideRows = false;
  if (filterMaxRows && filteredRows.length > filterMaxRows) {
    tooManyClientSideRows = true;
    filteredRows = filteredRows.slice(0, filterMaxRows);
  }

  // Push back to the caller a way to ask us where a row is.
  const { rowLookup } = props;
  if (rowLookup) {
    // Refs are cheap to assign to, so we don't bother doing this in a useEffect
    rowLookup.current = createRowLookup(columns, filteredRows, virtuosoRef);
  }

  useEffect(() => {
    setRowCount && filteredRows?.length !== undefined && setRowCount(filteredRows.length);
  }, [filteredRows?.length, setRowCount]);

  const noData = filteredRows.length === 0;
  const firstRowMessage =
    (noData && fallbackMessage) || (tooManyClientSideRows && "Hiding some rows, use filter...") || infoMessage;

  // If we're running in Jest, force using `as=div` b/c jsdom doesn't support react-virtuoso.
  // This enables still putting the application's business/rendering logic under test, and letting it
  // just trust the GridTable impl that, at runtime, `as=virtual` will (other than being virtualized)
  // behave semantically the same as `as=div` did for its tests.
  const _as = as === "virtual" && runningInJest ? "div" : as;
  return renders[_as](style, id, columns, headerRows, filteredRows, firstRowMessage, stickyHeader, xss, virtuosoRef);
}

// Determine which HTML element to use to build the GridTable
const renders: Record<RenderAs, typeof renderTable> = {
  table: renderTable,
  div: renderCssGrid,
  virtual: renderVirtual,
};

/** Renders as a CSS Grid, which is the default / most well-supported rendered. */
function renderCssGrid<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumn<R>[],
  headerRows: RowTuple<R>[],
  filteredRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
): ReactElement {
  return (
    <div
      css={{
        ...Css.dg.gtc(calcGridColumns(columns)).$,
        ...Css
          // Apply the between-row styling with `div + div > *` so that we don't have to have conditional
          // `if !lastRow add border` CSS applied via JS that would mean the row can't be React.memo'd.
          // The `div + div` is also the "owl operator", i.e. don't apply to the 1st row.
          .addIn("& > div + div > *", style.betweenRowsCss || {})
          // removes border between header and second row
          .addIn("& > div:nth-of-type(2) > *", style.firstNonHeaderRowCss || {}).$,
        ...style.rootCss,
        ...xss,
      }}
      data-testid={id}
    >
      {headerRows.map(([, node]) => node)}
      {/* Show an all-column-span info message if it's set. */}
      {firstRowMessage && (
        <div css={Css.add("gridColumn", `${columns.length} span`).$}>
          <div css={{ ...style.firstRowMessageCss }}>{firstRowMessage}</div>
        </div>
      )}
      {filteredRows.map(([, node]) => node)}
    </div>
  );
}

/** Renders as a table, primarily/solely for good print support. */
function renderTable<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumn<R>[],
  headerRows: RowTuple<R>[],
  filteredRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
): ReactElement {
  return (
    <table
      css={{
        ...Css.w100.add("borderCollapse", "collapse").$,
        ...Css.addIn("& > tbody > tr ", style.betweenRowsCss || {})
          // removes border between header and second row
          .addIn("& > tbody > tr:first-of-type", style.firstNonHeaderRowCss || {}).$,
        ...style.rootCss,
        ...xss,
      }}
      data-testid={id}
    >
      <thead>{headerRows.map(([, node]) => node)}</thead>
      <tbody>
        {/* Show an all-column-span info message if it's set. */}
        {firstRowMessage && (
          <tr>
            <td colSpan={columns.length} css={{ ...style.firstRowMessageCss }}>
              {firstRowMessage}
            </td>
          </tr>
        )}
        {filteredRows.map(([, node]) => node)}
      </tbody>
    </table>
  );
}

/**
 * Uses react-virtuoso to render rows virtually.
 *
 * It seems like react-virtuoso is the only one that can do _measured_ variable
 * sizes. I.e. react-window's variable list let's you provide a size, but it's
 * a size you lookup, not one that is measured from the DOM, see [1].
 *
 * I also tried react-virtual, which is headless and really small, but a) the
 * `measureRef` approach seems buggy [2] and b) rows were getting re-rendered
 * maybe due to [3] and they have no examples showing memoization, which is
 * concerning.
 *
 * react-virtuoso also seems like the most maintained (react-window is no
 * longer being actively worked on) and featureful library (like sticky headers),
 * so going with that for now.
 *
 * [1]: https://github.com/bvaughn/react-window/issues/6
 * [2]: https://github.com/tannerlinsley/react-virtual/issues/85
 * [3]: https://github.com/tannerlinsley/react-virtual/issues/108
 */
function renderVirtual<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumn<R>[],
  headerRows: RowTuple<R>[],
  filteredRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
): ReactElement {
  return (
    <Virtuoso
      ref={virtuosoRef}
      components={{ List: VirtualRoot(style, columns, id, xss) }}
      // Pin/sticky both the header row(s) + firstRowMessage to the top
      topItemCount={(stickyHeader ? headerRows.length : 0) + (firstRowMessage ? 1 : 0)}
      // Both the `Item` and `itemContent` use `display: contents`, so their height is 0,
      // so instead drill into the 1st real content cell.
      itemSize={(el) => (el.firstElementChild!.firstElementChild! as HTMLElement).offsetHeight}
      itemContent={(index) => {
        // We keep header and filter rows separate, but react-virtuoso is a flat list,
        // so we pick the right header / first row message / actual row.
        let i = index;
        if (i < headerRows.length) {
          return headerRows[i][1];
        }
        i -= headerRows.length;
        if (firstRowMessage) {
          if (i === 0) {
            return (
              <div css={Css.add("gridColumn", `${columns.length} span`).$}>
                <div css={{ ...style.firstRowMessageCss }}>{firstRowMessage}</div>
              </div>
            );
          }
          i -= 1;
        }
        return filteredRows[i][1];
      }}
      totalCount={(headerRows.length || 0) + (firstRowMessage ? 1 : 0) + (filteredRows.length || 0)}
    />
  );
}

/**
 * Customizes the `List` element that react-virtuoso renders, to have our css grid logic.
 *
 * We wrap this in memoizeOne so that React.createElement sees a consistent/stable component
 * identity, even though technically we have a different "component" per the given set of props
 * (solely to capture as params that we can't pass through react-virtuoso's API as props).
 */
const VirtualRoot = memoizeOne<(gs: GridStyle, columns: GridColumn<any>[], id: string, xss: any) => Components["List"]>(
  (gs, columns, id, xss) => {
    return React.forwardRef(({ style, children }, ref) => {
      // This re-renders each time we have new children in the view port
      return (
        <div
          ref={ref}
          style={style}
          css={{
            ...Css.dg.gtc(calcGridColumns(columns)).$,
            // Add an extra `> div` due to Item + itemContent both having divs
            ...Css.addIn("& > div + div > div > *", gs.betweenRowsCss || {}).$,
            // Add `display:contents` to Item to flatten it like we do GridRow
            ...Css.addIn("& > div", Css.display("contents").$).$,
            ...gs.rootCss,
            ...xss,
          }}
          data-testid={id}
        >
          {children}
        </div>
      );
    });
  },
);

function calcGridColumns(columns: GridColumn<any>[]): string {
  return (
    columns
      // Default to auto, but use `c.w` as a fr if numeric or else `c.w` as-if if a string
      .map((c) => (typeof c.w === "string" ? c.w : c.w !== undefined ? `${c.w}fr` : "auto"))
      .join(" ")
  );
}

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
 * - For client-side sorting, it the type `number`, to represent the current
 * column being sorted, in which case we use the GridCellContent.value.
 */
export type GridColumn<R extends Kinded, S = {}> = {
  [K in R["kind"]]:
    | string
    | (DiscriminateUnion<R, "kind", K> extends { data: infer D }
        ? (data: D, row: GridRowKind<R, K>) => ReactNode | GridCellContent
        : (row: GridRowKind<R, K>) => ReactNode | GridCellContent);
} & {
  /** The column's grid column width, defaults to `auto`. */
  w?: number | string;
  /** The column's default alignment for each cell. */
  align?: GridCellAlignment;
  /** Whether the column can be sorted (if client-side sorting). Defaults to true if sorting client-side. */
  clientSideSort?: boolean;
  /** This column's sort by value (if server-side sorting). */
  serverSideSortKey?: S;
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

function getIndentationCss<R extends Kinded>(
  style: GridStyle,
  rowStyle: RowStyle<R> | undefined,
  columnIndex: number,
  maybeContent: ReactNode | GridCellContent,
): Properties {
  // Look for cell-specific indent or row-specific indent (row-specific is only one the first column)
  const indent = (isContentAndSettings(maybeContent) && maybeContent.indent) || (columnIndex === 0 && rowStyle?.indent);
  return indent === 1 ? style.indentOneCss || {} : indent === 2 ? style.indentTwoCss || {} : {};
}

function getFirstOrLastCellCss<R extends Kinded>(
  style: GridStyle,
  columnIndex: number,
  columns: GridColumn<R>[],
): Properties {
  return {
    ...(columnIndex === 0 ? style.firstCellCss : {}),
    ...(columnIndex === columns.length - 1 ? style.lastCellCss : {}),
  };
}

export type GridCellAlignment = "left" | "right" | "center";

/**
 * Allows a cell to be more than just a RectNode, i.e. declare its alignment or
 * primitive value for filtering and sorting.
 */
export type GridCellContent = {
  content: ReactNode;
  alignment?: GridCellAlignment;
  /** Allow value to be a function in case it's a dynamic value i.e. reading from an inline-edited proxy. */
  value?: MaybeFn<number | string | Date | boolean | null | undefined>;
  /** The value to use specifically for sorting (i.e. if `value` is used for filtering); defaults to `value`. */
  sortValue?: MaybeFn<number | string | Date | boolean | null | undefined>;
  /** Whether to indent the cell. */
  indent?: 1 | 2;
};

type MaybeFn<T> = T | (() => T);

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
} & DiscriminateUnion<R, "kind", R["kind"]>;

interface GridRowProps<R extends Kinded, S> {
  as: RenderAs;
  columns: GridColumn<R>[];
  row: GridDataRow<R>;
  style: GridStyle;
  rowStyles: GridRowStyles<R> | undefined;
  stickyHeader: boolean;
  stickyOffset: string;
  sorting?: GridSortConfig<S>;
  sortState?: SortState<S>;
  setSortKey?: (value: S) => void;
  isCollapsed: boolean;
  toggleCollapsedId: (id: string) => void;
  openCards: NestedCardStyle[];
}

// We extract GridRow to its own mini-component primarily so we can React.memo'ize it.
function GridRow<R extends Kinded, S>(props: GridRowProps<R, S>): ReactElement {
  const {
    as,
    columns,
    row,
    style,
    rowStyles,
    stickyHeader,
    stickyOffset,
    sorting,
    sortState,
    setSortKey,
    isCollapsed,
    toggleCollapsedId,
    openCards,
    ...others
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
    ...((rowStyle?.rowLink || rowStyle?.onClick) &&
      style.rowHoverColor && {
        // Even though backgroundColor is set on the cellCss (due to display: content), the hover target is the row.
        "&:hover > *": Css.cursorPointer.bgColor(maybeDarken(rowStyleCellCss?.backgroundColor, style.rowHoverColor)).$,
      }),
    ...maybeApplyFunction(row, rowStyle?.rowCss),
  };

  const Row = as === "table" ? "tr" : "div";

  const div = (
    <Row css={rowCss} {...others}>
      {columns.map((column, idx) => {
        const maybeContent = applyRowFn(column, row);

        const canSortColumn =
          (sorting?.on === "client" && column.clientSideSort !== false) ||
          (sorting?.on === "server" && !!column.serverSideSortKey);
        const content = toContent(maybeContent, isHeader, canSortColumn);

        ensureClientSideSortValueIsSortable(sorting, isHeader, column, idx, maybeContent);

        const card = openCards.length > 0 && openCards[openCards.length - 1];

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
          // Then override with first/last cell styling
          ...getFirstOrLastCellCss(style, idx, columns),
          // Then override with per-cell/per-row justification/indentation
          ...getJustification(column, maybeContent, as),
          ...getIndentationCss(style, rowStyle, idx, maybeContent),
          // Then apply any header-specific override
          ...(isHeader && style.headerCellCss),
          ...(isHeader && stickyHeader && Css.sticky.top(stickyOffset).z1.$),
          // And finally the specific cell's css (if any from GridCellContent)
          ...rowStyleCellCss,
        };

        const renderFn: RenderCellFn<any> =
          rowStyle?.renderCell || rowStyle?.rowLink
            ? rowLinkRenderFn(as)
            : isHeader
            ? headerRenderFn(columns, column, sortState, setSortKey, as)
            : rowStyle?.onClick
            ? rowClickRenderFn(as)
            : defaultRenderFn(as);

        let rendered = renderFn(idx, cellCss, content, row, rowStyle);
        // Sneak in card padding for the 1st / last cells
        if (card && idx === 0) {
          rendered = addCardPadding(openCards, rendered, "left");
        } else if (card && idx === columns.length - 1) {
          rendered = addCardPadding(openCards, rendered, "right");
        }
        return rendered;
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
function toContent(content: ReactNode | GridCellContent, isHeader: boolean, canSortColumn: boolean): ReactNode {
  if (typeof content === "string" && isHeader && canSortColumn) {
    return <SortHeader content={content} />;
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
type GridSortContextProps = {
  sorted: "ASC" | "DESC" | undefined;
  toggleSort(): void;
};

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
  sortState: SortState<any> | undefined,
  setSortKey: Function | undefined,
  as: RenderAs,
) => RenderCellFn<any> = (columns, column, sortState, setSortKey, as) => (key, css, content) => {
  const [currentKey, direction] = sortState || [];
  // If server-side sorting, use the user's key for this column; client-side sorting, use the index.
  const ourSortKey = column.serverSideSortKey || columns.indexOf(column);
  const context: GridSortContextProps = {
    sorted: ourSortKey === currentKey ? direction : undefined,
    toggleSort: () => setSortKey!(ourSortKey),
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

// For alignment, use: 1) cell def, else 2) column def, else 3) left.
function getJustification(column: GridColumn<any>, maybeContent: ReactNode | GridCellContent, as: RenderAs) {
  const alignment = (isContentAndSettings(maybeContent) && maybeContent.alignment) || column.align || "left";
  // Always apply text alignment.
  const textAlign = Css.add("textAlign", alignmentToTextAlign[alignment]).$;
  if (as === "table") {
    return textAlign;
  }
  return { ...Css.jc(alignmentToJustify[alignment]).$, ...textAlign };
}

// We currently mutate `rows` while sorting; this would be bad if rows was directly
// read from an immutable store like the apollo cache, but we basically always make
// a copy in the process of adding our `kind` tags.
//
// I suppose that is an interesting idea, would we ever want to render a GQL query/cache
// result directly into the table without first doing a kind-mapping? Like maybe we could
// use __typename as the kind.
function sortRows<R extends Kinded>(
  columns: GridColumn<R>[],
  rows: GridDataRow<R>[],
  sortState: SortState<number>,
): void {
  sortBatch(columns, rows, sortState);
  // Recursively sort child rows
  for (const row of rows) {
    if (row.children) {
      sortRows(columns, row.children, sortState);
    }
  }
}

function sortBatch<R extends Kinded>(
  columns: GridColumn<R>[],
  batch: GridDataRow<R>[],
  sortState: SortState<number>,
): void {
  // When client-side sort, the sort value is the column index
  const [value, direction] = sortState;
  const column = columns[value];
  const invert = direction === "DESC";
  batch.sort((a, b) => {
    const v1 = sortValue(applyRowFn(column, a));
    const v2 = sortValue(applyRowFn(column, b));
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

/** Look at a row and get its sort value. */
function sortValue(value: ReactNode | GridCellContent): any {
  // Check sortValue and then fallback on value
  let maybeFn = value;
  if (value && typeof value === "object") {
    // Look for GridCellContent.sortValue, then GridCellContent.value
    if ("sortValue" in value) {
      maybeFn = value.sortValue;
    } else if ("value" in value) {
      maybeFn = value.value;
    } else if ("content" in value) {
      maybeFn = value.content;
    }
  }
  // Watch for functions that need to read from a potentially-changing proxy
  if (maybeFn instanceof Function) {
    return maybeFn();
  }
  return maybeFn;
}

/** Look at a row and get its filter value. */
function filterValue(value: ReactNode | GridCellContent): any {
  let maybeFn = value;
  if (value && typeof value === "object") {
    if ("value" in value) {
      maybeFn = value.value;
    } else if ("content" in value) {
      maybeFn = value.content;
    }
  }
  // Watch for functions that need to read from a potentially-changing proxy
  if (maybeFn instanceof Function) {
    return maybeFn();
  }
  return maybeFn;
}

/** Small custom hook that wraps the "setSortColumn inverts the current sort" logic. */
function useSortState<R extends Kinded, S>(
  columns: GridColumn<R, S>[],
  sorting?: GridSortConfig<S>,
): [SortState<S> | undefined, (value: S) => void] {
  // If we're server-side sorting, use the caller's `sorting.value` prop to initialize our internal
  // `useState`. After this, we ignore `sorting.value` because we assume it should match what our
  // `setSortState` just changed anyway (in response to the user sorting a column).
  const [sortState, setSortState] = useState<SortState<S> | undefined>(() => {
    if (sorting?.on === "client") {
      const { initial } = sorting;
      if (initial) {
        const key = typeof initial[0] === "number" ? initial[0] : columns.indexOf(initial[0] as any);
        return [key as any as S, initial[1]];
      } else {
        // If no explicit sorting, assume 1st column ascending
        const firstSortableColumn = columns.findIndex((c) => c.clientSideSort !== false);
        return [firstSortableColumn as any as S, "ASC"];
      }
    } else {
      return sorting?.value;
    }
  });

  // Make a custom setSortKey that is useState-like but contains the invert-if-same-column-clicked-twice logic.
  const setSortKey = useCallback(
    (clickedKey: S) => {
      const [currentKey, currentDirection] = sortState || [];
      const [newKey, newDirection] =
        // If clickedKey === currentKey, then toggle direction
        clickedKey === currentKey
          ? [currentKey, currentDirection === ASC ? DESC : ASC]
          : // Otherwise, use the new key, and default to ascending
            [clickedKey, ASC];
      setSortState([newKey, newDirection]);
      if (sorting?.on === "server") {
        sorting.onSort(newKey, newDirection);
      }
    },
    // Note that sorting.onSort is not listed here, so we bind to whatever the 1st sorting.onSort was
    [sortState, setSortState],
  );

  return [sortState, setSortKey];
}

/**
 * Wraps column header names with up/down sorting icons.
 *
 * GridTable will use this automatically if the header content is just a text string.
 *
 * Alternatively, callers can also:
 *
 * - Instantiate this SortHeader directly with some customizations in `xss`, or
 * - Write their own component that uses `GridSortContext` to access the column's
 *   current sort state + `toggleSort` function
 */
export function SortHeader(props: { content: string; xss?: Properties }) {
  const { content, xss } = props;
  const { sorted, toggleSort } = useContext(GridSortContext);
  const tid = useTestIds(props, "sortHeader");
  return (
    <div {...tid} css={{ ...Css.df.aic.cursorPointer.selectNone.$, ...xss }} onClick={toggleSort}>
      {content}
      {sorted === "ASC" && <Icon icon="sortUp" inc={2} {...tid.icon} xss={Css.mlPx(4).$} />}
      {sorted === "DESC" && <Icon icon="sortDown" inc={2} {...tid.icon} xss={Css.mlPx(4).$} />}
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
  let value = filterValue(maybeContent);
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
          // Find all non-leaf rows so that toggling "all collapsed" -> "all not collapsed" opens
          // the parent rows of any level.
          const parentIds = new Set<string>();
          const todo = [...rows];
          while (todo.length > 0) {
            const r = todo.pop()!;
            if (r.children) {
              parentIds.add(r.id);
              todo.push(...r.children);
            }
          }
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

function ensureClientSideSortValueIsSortable(
  sorting: GridSortConfig<any> | undefined,
  isHeader: boolean,
  column: GridColumn<any>,
  idx: number,
  maybeContent: ReactNode | GridCellContent,
): void {
  if (
    process.env.NODE_ENV !== "production" &&
    !isHeader &&
    sorting?.on === "client" &&
    column.clientSideSort !== false
  ) {
    const value = sortValue(maybeContent);
    if (!canClientSideSort(value)) {
      throw new Error(`Column ${idx} passed an unsortable value, use GridCellContent or clientSideSort=false`);
    }
  }
}

function canClientSideSort(value: any): boolean {
  const t = typeof value;
  return (
    value === null || t === "undefined" || t === "number" || t === "string" || t === "boolean" || value instanceof Date
  );
}

export function makeOpenOrCloseCard(openCards: NestedCardStyle[], kind: "open" | "close"): JSX.Element {
  let div: any = null;
  const place = kind === "open" ? "Top" : "Bottom";
  const btOrBb = kind === "open" ? "bt" : "bb";
  [...openCards].reverse().forEach((card) => {
    div = (
      <div
        css={{
          ...Css.bgColor(card.bgColor).pxPx(card.pxPx).$,
          ...(!div &&
            Css.add({
              [`border${place}RightRadius`]: `${card.brPx}px`,
              [`border${place}LeftRadius`]: `${card.brPx}px`,
            }).hPx(card.brPx).$),
          ...(card.bColor && Css.bc(card.bColor).bl.br.if(div)[btOrBb].$),
        }}
      >
        {div}
      </div>
    );
  });
  return div;
}

/** For the first or last cell, nest them in divs that re-create the outer card padding + background. */
export function addCardPadding(openCards: NestedCardStyle[], div: any, kind: "left" | "right"): any {
  const copy = [...openCards];
  copy.reverse().forEach((card) => {
    div = <div css={Css.bgColor(card.bgColor).pxPx(card.pxPx).if(!!card.bColor).bc(card.bColor).bl.br.$}>{div}</div>;
  });
  return div;
}
