import memoizeOne from "memoize-one";
import { Observer } from "mobx-react";
import React, {
  MutableRefObject,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { Components, Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { navLink } from "src/components/CssReset";
import { PresentationProvider } from "src/components/PresentationContext";
import { createRowLookup, GridRowLookup } from "src/components/Table/GridRowLookup";
import { GridSortContext, GridSortContextProps } from "src/components/Table/GridSortContext";
import { maybeAddCardPadding, NestedCards } from "src/components/Table/nestedCards";
import { SortHeader } from "src/components/Table/SortHeader";
import { ensureClientSideSortValueIsSortable, sortRows } from "src/components/Table/sortRows";
import { SortState, useSortState } from "src/components/Table/useSortState";
import { Css, Margin, Only, Properties, Xss } from "src/Css";
import tinycolor from "tinycolor2";
import { defaultStyle } from ".";

export type Kinded = { kind: string };
export type GridTableXss = Xss<Margin>;

export const ASC = "ASC" as const;
export const DESC = "DESC" as const;
export type Direction = "ASC" | "DESC";
export const emptyCell: () => ReactNode = () => <></>;

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

export interface GridTableDefaults {
  style: GridStyle;
  stickyHeader: boolean;
}

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

/** The GridDataRow is optional b/c the nested card chrome rows only have ReactElements. */
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
      onSort: (orderBy: S | undefined, direction: Direction | undefined) => void;
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
  /** Experimental API allowing one to scroll to a table index. Primarily intended for stories at the moment */
  api?: MutableRefObject<GridTableApi | undefined>;
}

/** NOTE: This API is experimental and primarily intended for story and testing purposes */
export type GridTableApi = {
  scrollToIndex: (index: number) => void;
};

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
 * In a "kind" of cute way, headers are not modeled specially, i.e. they are just another
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
    api,
  } = props;

  const [collapsedIds, collapseAllContext, collapseRowContext] = useToggleIds(rows, persistCollapse);
  // We only use this in as=virtual mode, but keep this here for rowLookup to use
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  if (api) {
    api.current = {
      scrollToIndex: (index) => virtuosoRef.current && virtuosoRef.current.scrollToIndex(index),
    };
  }

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

    const columnSizes =
      as === "virtual" ? calcVirtualGridColumns(columns, style.nestedCards?.firstLastColumnWidth) : undefined;

    function makeRowComponent(row: GridDataRow<R>): JSX.Element {
      // We only pass sortState to header rows, b/c non-headers rows shouldn't have to re-render on sorting
      // changes, and so by not passing the sortProps, it means the data rows' React.memo will still cache them.
      const sortProps = row.kind === "header" ? { sorting, sortState, setSortKey } : { sorting };
      const RowComponent = observeRows ? ObservedGridRow : MemoizedGridRow;

      const openCards = row.kind === "header" ? headerCards : rowCards;

      return (
        <GridCollapseContext.Provider
          key={`${row.kind}-${row.id}`}
          value={row.kind === "header" ? collapseAllContext : collapseRowContext}
        >
          <RowComponent
            {...{
              as,
              columns,
              row,
              style,
              rowStyles,
              stickyHeader,
              stickyOffset,
              openCards: openCards ? openCards.currentOpenCards() : undefined,
              columnSizes,
              ...sortProps,
            }}
          />
        </GridCollapseContext.Provider>
      );
    }

    // Split out the header rows from the data rows so that we can put an `infoMessage` in between them (if needed).
    const headerRows: RowTuple<R>[] = [];
    const filteredRows: RowTuple<R>[] = [];

    // Misc state to track our nested card-ification, i.e. interleaved actual rows + chrome rows
    // for the header and row (non-header rows) cards.
    const headerCards = !!style.nestedCards && new NestedCards(columns, headerRows, style.nestedCards);
    const rowCards = !!style.nestedCards && new NestedCards(columns, filteredRows, style.nestedCards);

    // Depth-first to filter
    function visit(row: GridDataRow<R>): void {
      const matches =
        filters.length === 0 ||
        row.pin ||
        filters.every((filter) =>
          columns.map((c) => applyRowFn(c, row)).some((maybeContent) => matchesFilter(maybeContent, filter)),
        );
      // Even if we don't pass the filter, one of our children might, so we continue on after this check
      let isCard = false;

      if (matches) {
        isCard = rowCards && rowCards.maybeOpenCard(row);
        filteredRows.push([row, makeRowComponent(row)]);
      }

      const isCollapsed = collapsedIds.includes(row.id);
      if (!isCollapsed && !!row.children?.length) {
        rowCards && matches && rowCards.addSpacer();
        visitRows(row.children, isCard);
      }

      isCard && rowCards && rowCards.closeCard();
    }

    function visitRows(rows: GridDataRow<R>[], addSpacer: boolean): void {
      const length = rows.length;
      rows.forEach((row, i) => {
        if (row.kind === "header") {
          // Flag to determine if the header has nested card styles.
          // This will determine if we should include opening and closing
          // Chrome rows.
          const isHeaderNested = !!style.nestedCards?.kinds["header"];

          isHeaderNested && headerCards && headerCards.maybeOpenCard(row);
          headerRows.push([row, makeRowComponent(row)]);
          isHeaderNested && headerCards && headerCards.closeCard();

          isHeaderNested && headerCards && headerCards.done();

          return;
        }

        visit(row);

        addSpacer && rowCards && i !== length - 1 && rowCards.addSpacer();
      });
    }

    // If nestedCards is set, we assume the top-level kind is a card, and so should add spacers between them
    visitRows(maybeSorted, !!rowCards);
    rowCards && rowCards.done();

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
    collapseAllContext,
    collapseRowContext,
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
  return (
    <PresentationProvider fieldProps={{ hideLabel: true, numberAlignment: "right", compact: true }}>
      {renders[_as](
        style,
        id,
        columns,
        headerRows,
        filteredRows,
        firstRowMessage,
        stickyHeader,
        style.nestedCards?.firstLastColumnWidth,
        xss,
        virtuosoRef,
      )}
    </PresentationProvider>
  );
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
  _stickyHeader: boolean,
  firstLastColumnWidth: number | undefined,
  xss: any,
  _virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
): ReactElement {
  // We must determine if the header is using nested card styles to account for
  // the opening and closing Chrome rows.
  const isNestedCardStyleHeader = !!style.nestedCards?.kinds["header"];
  /*
    Determine at what CSS selector index is the first non header row. Note that
    CSS selectors are not zero-based, unlike JavaScript, so we must add 1 to
    what we'd normally expect.

    Ex: When we don't have nestedCard styled headers, then we don't have opening
    and closing Chrome rows. Therefore, the first non-header row is the second
    row and since CSS selectors are not zero-based, we are aiming for a value
    of 2 (1 + 1).

    Ex: When we have nestedCard styled headers, then we have opening and closing
    Chrome rows. Therefore, the first non-header row is the fourth row because:
    - Row 1 is the opening Chrome Row
    - Row 2 is the header
    - Row 3 is the closing Chrome Row
    - Row 4 is the first non-header row
    And since CSS selectors are not zero-based, we are aiming for a value of 4
    (3 + 1).
  */
  const firstNonHeaderRowIndex = (!isNestedCardStyleHeader ? 1 : 3) + 1;

  return (
    <div
      css={{
        ...Css.dg.gtc(calcDivGridColumns(columns, firstLastColumnWidth)).$,
        /*
          Using n + (firstNonHeaderRowIndex + 1) here to target all rows that
          are after the first non-header row. Since n starts at 0, we can use
          the + operator as an offset.

          Inspired by: https://stackoverflow.com/a/25005740/2551333
        */
        ...(style.betweenRowsCss
          ? Css.addIn(`& > div:nth-of-type(n + ${firstNonHeaderRowIndex + 1}) > *`, style.betweenRowsCss).$
          : {}),
        ...(style.firstNonHeaderRowCss
          ? Css.addIn(`& > div:nth-of-type(${firstNonHeaderRowIndex}) > *`, style.firstNonHeaderRowCss).$
          : {}),
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
  _stickyHeader: boolean,
  _firstLastColumnWidth: number | undefined,
  xss: any,
  _virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
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
  firstLastColumnWidth: number | undefined,
  xss: any,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
): ReactElement {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { footerStyle, listStyle } = useMemo(() => {
    const { paddingBottom, ...otherRootStyles } = style.rootCss ?? {};
    return { footerStyle: { paddingBottom }, listStyle: { ...style, rootCss: otherRootStyles } };
  }, [style]);

  return (
    <Virtuoso
      overscan={5}
      ref={virtuosoRef}
      components={{
        List: VirtualRoot(listStyle, columns, id, firstLastColumnWidth, xss),
        Footer: () => <div css={footerStyle} />,
      }}
      // Pin/sticky both the header row(s) + firstRowMessage to the top
      topItemCount={(stickyHeader ? headerRows.length : 0) + (firstRowMessage ? 1 : 0)}
      itemSize={(el) => {
        const maybeContentsDiv = el.firstElementChild! as HTMLElement;

        // If it is a chrome row, then we are not using `display: contents;`, return the height of this element.
        if ("chrome" in maybeContentsDiv.dataset) {
          return maybeContentsDiv.getBoundingClientRect().height || 1;
        }

        // Both the `Item` and `itemContent` use `display: contents`, so their height is 0,
        // so instead drill into the 1st real content cell.
        return (maybeContentsDiv.firstElementChild! as HTMLElement).getBoundingClientRect().height;
      }}
      itemContent={(index) => {
        // Since we have two arrays of rows: `headerRows` and `filteredRow` we
        // must determine which one to render.

        // Determine if we need to render a header row
        if (index < headerRows.length) {
          return headerRows[index][1];
        }

        // Reset index
        index -= headerRows.length;

        // Show firstRowMessage as the first `filteredRow`
        if (firstRowMessage) {
          if (index === 0) {
            return (
              <div css={Css.add("gridColumn", `${columns.length} span`).$}>
                <div css={{ ...style.firstRowMessageCss }}>{firstRowMessage}</div>
              </div>
            );
          }

          // Shift index -1 when there is a firstRowMessage to not skip the
          // first `filteredRow`
          index--;
        }

        // Lastly render `filteredRow`
        return filteredRows[index][1];
      }}
      totalCount={(headerRows.length || 0) + (firstRowMessage ? 1 : 0) + (filteredRows.length || 0)}
    />
  );
}

/**
 * A table might render two of these components to represent two virtual lists.
 * This generally happens when `topItemCount` prop is used and React-Virtuoso
 * creates to Virtual lists where the first represents, generally, the header
 * rows and the second represents the non-header rows (list rows).
 *
 * The main goal of this custom component is to:
 * - Customize the list wrapper to our css grid logic styles
 *
 * We wrap this in memoizeOne so that React.createElement sees a
 * consistent/stable component identity, even though technically we have a
 * different "component" per the given set of props (solely to capture as
 * params that we can't pass through react-virtuoso's API as props).
 */
const VirtualRoot = memoizeOne<
  (
    gs: GridStyle,
    columns: GridColumn<any>[],
    id: string,
    firstLastColumnWidth: number | undefined,
    xss: any,
  ) => Components["List"]
>((gs, _columns, id, _firstLastColumnWidth, xss) => {
  return React.forwardRef(function VirtualRoot({ style, children }, ref) {
    // This VirtualRoot list represent the header when no styles are given. The
    // table list generally has styles to scroll the page for windowing.
    const isHeader = Object.keys(style || {}).length === 0;

    // This re-renders each time we have new children in the viewport
    return (
      <div
        ref={ref}
        style={{ ...style, ...(gs.nestedCards ? { minWidth: "fit-content" } : {}) }}
        css={{
          // Add an extra `> div` due to Item + itemContent both having divs
          ...Css.addIn("& > div + div > div > *", gs.betweenRowsCss || {}).$,
          // Table list styles only
          ...(isHeader
            ? {}
            : {
                ...Css.addIn("& > div:first-of-type > *", gs.firstNonHeaderRowCss).$,
              }),
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
 * Creates a `grid-template-column` specific to our virtual output.
 *
 * Because of two things:
 *
 * a) react-virtuoso puts the header in a different div than the normal rows, and
 *
 * b) content-aware sizing just in general look janky/constantly resize while scrolling
 *
 * When we're as=virtual, we change our default + enforce only fixed-sized units (% and px)
 */
export function calcVirtualGridColumns(columns: GridColumn<any>[], firstLastColumnWidth: number | undefined): string[] {
  // For both default columns (1fr) as well as `w: 4fr` columns, we translate the width into an expression that looks like:
  // calc((100% - allOtherPercent - allOtherPx) * ((myFr / totalFr))`
  //
  // Which looks _a lot_ like how `fr` units just work out-of-the-box.
  //
  // Unfortunately, something about having our header & body rows in separate divs (which is controlled
  // by react-virtuoso), even if they have the same width, for some reason `fr` units between the two
  // will resolve every slightly differently, where as this approach they will match exactly.
  const { claimedPercentages, claimedPixels, totalFr } = columns.reduce(
    (acc, { w }) => {
      if (typeof w === "undefined") {
        return { ...acc, totalFr: acc.totalFr + 1 };
      } else if (typeof w === "number") {
        return { ...acc, totalFr: acc.totalFr + w };
      } else if (w.endsWith("fr")) {
        return { ...acc, totalFr: acc.totalFr + Number(w.replace("fr", "")) };
      } else if (w.endsWith("px")) {
        return { ...acc, claimedPixels: acc.claimedPixels + Number(w.replace("px", "")) };
      } else if (w.endsWith("%")) {
        return { ...acc, claimedPercentages: acc.claimedPercentages + Number(w.replace("%", "")) };
      } else {
        throw new Error("as=virtual only supports px, percentage, or fr units");
      }
    },
    { claimedPercentages: 0, claimedPixels: firstLastColumnWidth ? firstLastColumnWidth * 2 : 0, totalFr: 0 },
  );

  // This is our "fake but for some reason it lines up better" fr calc
  function fr(myFr: number): string {
    return `((100% - ${claimedPercentages}% - ${claimedPixels}px) * (${myFr} / ${totalFr}))`;
  }

  let sizes = columns.map(({ w }) => {
    if (typeof w === "undefined") {
      return fr(1);
    } else if (typeof w === "string") {
      if (w.endsWith("%") || w.endsWith("px")) {
        return w;
      } else if (w.endsWith("fr")) {
        return fr(Number(w.replace("fr", "")));
      } else {
        throw new Error("as=virtual only supports px, percentage, or fr units");
      }
    } else {
      return fr(w);
    }
  });

  return maybeAddCardColumns(sizes, firstLastColumnWidth);
}

export function calcDivGridColumns(columns: GridColumn<any>[], firstLastColumnWidth: number | undefined): string {
  const sizes = columns.map(({ w }) => {
    if (typeof w === "undefined") {
      // Hrm, I waffle between 'auto' or '1fr' being the better default here...
      return "auto";
    } else if (typeof w === "string") {
      // Use whatever the user passed in
      return w;
    } else {
      // Otherwise assume fr units
      return `${w}fr`;
    }
  });
  return maybeAddCardColumns(sizes, firstLastColumnWidth).join(" ");
}

// If we're doing nested cards, we add extra 1st/last cells...
function maybeAddCardColumns(sizes: string[], firstLastColumnWidth: number | undefined): string[] {
  return !firstLastColumnWidth ? sizes : [`${firstLastColumnWidth}px`, ...sizes, `${firstLastColumnWidth}px`];
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
 * - For client-side sorting, it's type `number`, to represent the current
 * column being sorted, in which case we use the GridCellContent.value.
 */
export type GridColumn<R extends Kinded, S = {}> = {
  [K in R["kind"]]:
    | string
    | (DiscriminateUnion<R, "kind", K> extends { data: infer D }
        ? (data: D, row: GridRowKind<R, K>) => ReactNode | GridCellContent
        : (row: GridRowKind<R, K>) => ReactNode | GridCellContent);
} & {
  /**
   * The column's grid column width.
   *
   * For `as=div` output:
   *
   * - Any CSS grid units are supported
   * - Numbers are treated as `fr` units
   * - The default value is `auto`, which in CSS grid will do content-aware/responsive layout.
   *
   * For `as=virtual` output:
   *
   * - Only px, percentage, or fr units are supported, due to a) react-virtuoso puts the sticky header
   * rows in a separate `div` and so we end up with two `grid-template-columns`, so cannot rely on
   * any content-aware sizing, and b) content-aware sizing in a scrolling/virtual table results in
   * a ~janky experience as the columns will constantly resize as new/different content is put in/out
   * of the DOM.
   * - Numbers are treated as `fr` units
   * - The default value is `1fr`
   */
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
  const indent = (isGridCellContent(maybeContent) && maybeContent.indent) || (columnIndex === 0 && rowStyle?.indent);
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
  /** The JSX content of the cell. Virtual tables that client-side sort should use a function to avaid perf overhead. */
  content: ReactNode | (() => ReactNode);
  alignment?: GridCellAlignment;
  /** Allow value to be a function in case it's a dynamic value i.e. reading from an inline-edited proxy. */
  value?: MaybeFn<number | string | Date | boolean | null | undefined>;
  /** The value to use specifically for sorting (i.e. if `value` is used for filtering); defaults to `value`. */
  sortValue?: MaybeFn<number | string | Date | boolean | null | undefined>;
  /** Whether to indent the cell. */
  indent?: 1 | 2;
  colspan?: number;
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
  /** Whether to pin this sort to the first/last of its parent's children. */
  pin?: "first" | "last";
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
  // NOTE: openCards is a string of colon separated open kinds, so that the result is stable across renders.
  openCards: string | undefined;
  // Required for setting column widths in a virtualized table
  columnSizes: string[] | undefined;
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
    openCards,
    columnSizes,
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
    // For virtual tables use `display: flex` to keep all cells on the same row, but use `flexNone` to ensure the cells stay their defined widths
    ...(as === "table" ? {} : as === "virtual" ? Css.df.addIn("&>*", Css.flexNone.$).$ : Css.display("contents").$),
    ...((rowStyle?.rowLink || rowStyle?.onClick) &&
      style.rowHoverColor && {
        // Even though backgroundColor is set on the cellCss (due to display: content), the hover target is the row.
        "&:hover > *": Css.cursorPointer.bgColor(maybeDarken(rowStyleCellCss?.backgroundColor, style.rowHoverColor)).$,
      }),
    ...maybeApplyFunction(row, rowStyle?.rowCss),
  };

  const Row = as === "table" ? "tr" : "div";

  const openCardStyles =
    typeof openCards === "string"
      ? openCards
          .split(":")
          .map((openCardKind) => style.nestedCards!.kinds[openCardKind])
          .filter((style) => style)
      : undefined;
  const currentCard = openCardStyles && openCardStyles[openCardStyles.length - 1];
  let currentColspan = 1;
  const maybeStickyHeaderStyles = isHeader && stickyHeader ? Css.sticky.top(stickyOffset).z1.$ : undefined;

  return (
    <Row css={rowCss} {...others}>
      {openCardStyles &&
        maybeAddCardPadding(openCardStyles, "first", {
          ...maybeStickyHeaderStyles,
          ...(columnSizes ? Css.w(columnSizes[0]).$ : {}),
        })}
      {columns.map((column, columnIndex) => {
        // Decrement colspan count and skip if greater than 1.
        if (currentColspan > 1) {
          currentColspan -= 1;
          return;
        }
        const maybeContent = applyRowFn(column, row);
        currentColspan = isGridCellContent(maybeContent) ? maybeContent.colspan ?? 1 : 1;

        const canSortColumn =
          (sorting?.on === "client" && column.clientSideSort !== false) ||
          (sorting?.on === "server" && !!column.serverSideSortKey);
        const content = toContent(maybeContent, isHeader, canSortColumn, sorting?.on === "client", style, as);

        ensureClientSideSortValueIsSortable(sorting, isHeader, column, columnIndex, maybeContent);
        const maybeNestedCardColumnIndex = columnIndex + (style.nestedCards ? 1 : 0);

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
          ...getFirstOrLastCellCss(style, columnIndex, columns),
          // Then override with per-cell/per-row justification/indentation
          ...getJustification(column, maybeContent, as),
          ...getIndentationCss(style, rowStyle, columnIndex, maybeContent),
          // Then apply any header-specific override
          ...(isHeader && style.headerCellCss),
          // Non-virtualized tables use h100 so that all cells are the same height across the row.
          // Virtualized table rows use `display: flex;`, so the flex children are set to `align-self: stretch` by default, which achieves the same goal.
          // Though, we need to omit setting `h100` on the flex children, as a flex container needs a defined height set for `h100` to work on flex children
          ...(isHeader && as !== "virtual" ? Css.h100.$ : undefined),
          ...maybeStickyHeaderStyles,
          // If we're within a card, use its background color
          ...(currentCard && Css.bgColor(currentCard.bgColor).$),
          // Add in colspan css if needed
          ...(currentColspan > 1 ? Css.gc(`span ${currentColspan}`).$ : {}),
          // And finally the specific cell's css (if any from GridCellContent)
          ...rowStyleCellCss,
          // For virtual tables we define the width of the column on each cell. Supports col spans.
          ...(columnSizes && {
            width: `calc(${columnSizes
              .slice(maybeNestedCardColumnIndex, maybeNestedCardColumnIndex + currentColspan)
              .join(" + ")})`,
          }),
        };

        const renderFn: RenderCellFn<any> =
          rowStyle?.renderCell || rowStyle?.rowLink
            ? rowLinkRenderFn(as)
            : isHeader
            ? headerRenderFn(columns, column, sortState, setSortKey, as)
            : rowStyle?.onClick
            ? rowClickRenderFn(as)
            : defaultRenderFn(as);

        return renderFn(columnIndex, cellCss, content, row, rowStyle);
      })}
      {openCardStyles &&
        maybeAddCardPadding(openCardStyles, "final", {
          ...maybeStickyHeaderStyles,
          ...(columnSizes ? Css.w(columnSizes[columnSizes.length - 1]).$ : {}),
        })}
    </Row>
  );
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

/** A heuristic to detect the result of `React.createElement` / i.e. JSX. */
function isJSX(content: any): boolean {
  return typeof content === "object" && content && "type" in content && "props" in content;
}

/** If a column def return just string text for a given row, apply some default styling. */
function toContent(
  content: ReactNode | GridCellContent,
  isHeader: boolean,
  canSortColumn: boolean,
  isClientSideSorting: boolean,
  style: GridStyle,
  as: RenderAs,
): ReactNode {
  content = isGridCellContent(content) ? content.content : content;
  if (typeof content === "function") {
    // Actually create the JSX by calling `content()` here (which should be as late as
    // possible, i.e. only for visible rows if we're in a virtual table).
    content = content();
  } else if (as === "virtual" && canSortColumn && isClientSideSorting && isJSX(content)) {
    // When using client-side sorting, we call `applyRowFn` not only during rendering, but
    // up-front against all rows (for the currently sorted column) to determine their
    // sort values.
    //
    // Pedantically this means that any table using client-side sorting should not
    // build JSX directly in its GridColumn functions, but this overhead is especially
    // noticeable for large/virtualized tables, so we only enforce using functions
    // for those tables.
    throw new Error(
      "GridTables with as=virtual & sortable columns should use functions that return JSX, instead of JSX",
    );
  }
  if (content && typeof content === "string" && isHeader && canSortColumn) {
    return <SortHeader content={content} />;
  } else if (style.emptyCell && isContentEmpty(content)) {
    // If the content is empty and the user specified an `emptyCell` node, return that.
    return style.emptyCell;
  }
  return content;
}

function isGridCellContent(content: ReactNode | GridCellContent): content is GridCellContent {
  return typeof content === "object" && !!content && "content" in content;
}

const emptyValues = ["", null, undefined] as any[];
function isContentEmpty(content: ReactNode): boolean {
  return emptyValues.includes(content);
}

/** Return the content for a given column def applied to a given row. */
export function applyRowFn<R extends Kinded>(column: GridColumn<R>, row: GridDataRow<R>): ReactNode | GridCellContent {
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
 * Provides each row access to a method to check if it is collapsed and toggle it's collapsed state.
 *
 * Calling `toggleCollapse` will keep the row itself showing, but will hide any
 * children rows (specifically those that have this row's `id` in their `parentIds`
 * prop).
 *
 * headerCollapsed is used to trigger rows at the root level to rerender their chevron when all are
 * collapsed/expanded.
 */
type GridCollapseContextProps = {
  headerCollapsed: boolean;
  isCollapsed: (id: string) => boolean;
  toggleCollapsed(id: string): void;
};

export const GridCollapseContext = React.createContext<GridCollapseContextProps>({
  headerCollapsed: false,
  isCollapsed: () => false,
  toggleCollapsed: () => {},
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
  const alignment = (isGridCellContent(maybeContent) && maybeContent.alignment) || column.align || "left";
  // Always apply text alignment.
  const textAlign = Css.add("textAlign", alignmentToTextAlign[alignment]).$;
  if (as === "table") {
    return textAlign;
  }
  return { ...Css.jc(alignmentToJustify[alignment]).$, ...textAlign };
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
function useToggleIds(
  rows: GridDataRow<Kinded>[],
  persistCollapse: string | undefined,
): readonly [string[], GridCollapseContextProps, GridCollapseContextProps] {
  // Make a list that we will only mutate, so that our callbacks have a stable identity.
  const [collapsedIds] = useState<string[]>(getCollapsedRows(persistCollapse));
  // Use this to trigger the component to re-render even though we're not calling `setList`
  const [tick, setTick] = useState<string>("");

  // Checking whether something is collapsed does not depend on anything
  const isCollapsed = useCallback(
    (id: string) => collapsedIds.includes(id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const collapseAllContext = useMemo(
    () => {
      // Create the stable `toggleCollapsed`, i.e. we are purposefully passing an (almost) empty dep list
      // Since only toggling all rows required knowledge of what the rows are
      const toggleAll = (_id: string) => {
        // We have different behavior when going from expand/collapse all.
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
        if (persistCollapse) {
          localStorage.setItem(persistCollapse, JSON.stringify(collapsedIds));
        }
        // Trigger a re-render
        setTick(collapsedIds.join(","));
      };
      return { headerCollapsed: isCollapsed("header"), isCollapsed, toggleCollapsed: toggleAll };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows],
  );

  const collapseRowContext = useMemo(
    () => {
      // Create the stable `toggleCollapsed`, i.e. we are purposefully passing an empty dep list
      // Since toggling a single row does not need to know about the other rows
      const toggleRow = (id: string) => {
        // This is the regular/non-header behavior to just add/remove the individual row id
        const i = collapsedIds.indexOf(id);
        if (i === -1) {
          collapsedIds.push(id);
        } else {
          collapsedIds.splice(i, 1);
        }
        if (persistCollapse) {
          localStorage.setItem(persistCollapse, JSON.stringify(collapsedIds));
        }
        // Trigger a re-render
        setTick(collapsedIds.join(","));
      };
      return { headerCollapsed: isCollapsed("header"), isCollapsed, toggleCollapsed: toggleRow };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collapseAllContext.isCollapsed("header")],
  );

  // Return a copy of the list, b/c we want external useMemos that do explicitly use the
  // entire list as a dep to re-render whenever the list is changed (which they need to
  // see as new list identity).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const copy = useMemo(() => [...collapsedIds], [tick, collapsedIds]);
  return [copy, collapseAllContext, collapseRowContext] as const;
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
