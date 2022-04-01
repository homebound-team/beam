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
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { Components, Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { navLink } from "src/components/CssReset";
import {
  PresentationContextProps,
  PresentationFieldProps,
  PresentationProvider,
} from "src/components/PresentationContext";
import { useSetupColumnSizes } from "src/components/Table/columnSizes";
import { createRowLookup, GridRowLookup } from "src/components/Table/GridRowLookup";
import { GridSortContext, GridSortContextProps } from "src/components/Table/GridSortContext";
import {
  getCurrentBgColor,
  getNestedCardStyles,
  isLeafRow,
  NestedCards,
  wrapCard,
} from "src/components/Table/nestedCards";
import { RowState, RowStateContext } from "src/components/Table/RowState";
import { SortHeader } from "src/components/Table/SortHeader";
import { ensureClientSideSortValueIsSortable, sortRows } from "src/components/Table/sortRows";
import { SortState, useSortState } from "src/components/Table/useSortState";
import { visit } from "src/components/Table/visitor";
import { Css, Margin, Only, Palette, Properties, Typography, Xss } from "src/Css";
import { useComputed } from "src/hooks";
import { useRenderCount } from "src/hooks/useRenderCount";
import { defaultStyle } from ".";

export type Kinded = { kind: string };
export type GridTableXss = Xss<Margin>;

export const ASC = "ASC" as const;
export const DESC = "DESC" as const;
export type Direction = "ASC" | "DESC";
export const emptyCell: GridCellContent = { content: () => <></>, value: "" };

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
  rowHoverColor?: Palette;
  /** Styling for our special "nested card" output mode. */
  nestedCards?: NestedCardsStyle;
  /** Default content to put into an empty cell */
  emptyCell?: ReactNode;
  presentationSettings?: Pick<PresentationFieldProps, "borderless" | "typeScale"> &
    Pick<PresentationContextProps, "wrap">;
  /** Minimum table width in pixels. Used when calculating columns sizes */
  minWidthPx?: number;
  /** Css to apply at each level of a parent/child nested table. */
  levels?: Record<number, { cellCss: Properties }>;
  /** Allows for customization of the background color used to denote an "active" row */
  activeBgColor?: Palette;
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
  /** Allows for customization of the border color used to denote an "active" row */
  activeBColor?: Palette;
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
type ParentChildrenTuple<R extends Kinded> = [GridDataRow<R>, ParentChildrenTuple<R>[]];

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
  api?: MutableRefObject<GridTableApi<R> | undefined>;
  /** Experimental, expecting to be removed - Specify the element in which the table should resize its columns against. If not set, the table will resize columns based on its owns container's width */
  resizeTarget?: MutableRefObject<HTMLElement | null>;
  /**
   * Defines which row in the table should be provided with an "active" styling.
   * Expected format is `${row.kind}_${row.id}`. This helps avoid id conflicts between rows of different types/kinds that may have the same id.
   * Example "data_123"
   */
  activeRowId?: string;
}

/** NOTE: This API is experimental and primarily intended for story and testing purposes */
export type GridTableApi<R extends Kinded> = {
  scrollToIndex: (index: number) => void;

  /** Returns the ids of currently-selected rows. */
  getSelectedRowIds(): string[];
  getSelectedRowIds<K extends R["kind"]>(kind: K): string[];

  /** Returns the currently-selected rows. */
  getSelectedRows(): GridDataRow<R>[];
  getSelectedRows<K extends R["kind"]>(kind: K): GridDataRow<DiscriminateUnion<R, "kind", K>>[];

  /** Sets the internal state of 'activeRowId' */
  setActiveRowId: (id: string | undefined) => void;
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
    id = "gridTable",
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
    api: callerApi,
    resizeTarget,
    activeRowId,
  } = props;

  // Create a ref that always contains the latest rows, for our effectively-singleton RowState to use
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const [rowState] = useState(() => new RowState(rowsRef, persistCollapse, activeRowId));

  // We only use this in as=virtual mode, but keep this here for rowLookup to use
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const tableRef = useRef<HTMLElement>(null);

  const api = useRef<GridTableApi<R>>({
    scrollToIndex: (index) => virtuosoRef.current && virtuosoRef.current.scrollToIndex(index),
    getSelectedRowIds(kind?: string): string[] {
      if (kind === undefined) {
        return rowState.selectedIds;
      } else {
        return this.getSelectedRows(kind).map((row) => row.id);
      }
    },
    // The any is not great, but getting the overload to handle the optional kind is annoying
    getSelectedRows(kind?: string): any {
      const ids = rowState.selectedIds;
      const selected: GridDataRow<R>[] = [];
      visit(rows, (row) => {
        if (ids.includes(row.id) && (!kind || row.kind === kind)) {
          selected.push(row as any);
        }
      });
      return selected;
    },
    setActiveRowId: (id: string | undefined) => (rowState.activeRowId = id),
  });

  if (callerApi) {
    callerApi.current = api.current;
  }

  useEffect(() => {
    rowState.activeRowId = activeRowId;
  }, [rowState, activeRowId]);

  // We track render count at the table level, which seems odd (we should be able to track this
  // internally within each GridRow using a useRef), but we have suspicions that react-virtuoso
  // (or us) is resetting component state more than necessary, so we track render counts from
  // here instead.
  const { getCount } = useRenderCount();

  const columnSizes = useSetupColumnSizes(style, columns, tableRef, resizeTarget);

  // Make a single copy of our current collapsed state, so we'll have a single observer.
  const collapsedIds = useComputed(() => rowState.collapsedIds, [rowState]);

  const [sortState, setSortKey] = useSortState<R, S>(columns, sorting);
  const maybeSorted = useMemo(() => {
    if (sorting?.on === "client" && sortState) {
      // If using client-side sort, the sortState use S = number
      return sortRows(columns, rows, sortState as any as SortState<number>);
    }
    return rows;
  }, [columns, rows, sorting, sortState]);

  // Filter rows - ensures parent rows remain in the list if any children match the filter.
  const filterRows: (acc: ParentChildrenTuple<R>[], row: GridDataRow<R>) => ParentChildrenTuple<R>[] = useCallback(
    (acc: ParentChildrenTuple<R>[], row: GridDataRow<R>) => {
      // Break up "foo bar" into `[foo, bar]` and a row must match both `foo` and `bar`
      const filters = (filter && filter.split(/ +/)) || [];
      const matches =
        row.kind === "header" ||
        filters.length === 0 ||
        !!row.pin ||
        filters.every((f) =>
          columns.map((c) => applyRowFn(c, row, api)).some((maybeContent) => matchesFilter(maybeContent, f)),
        );

      if (matches) {
        return acc.concat([[row, row.children?.reduce(filterRows, []) ?? []]]);
      }

      const isCollapsed = collapsedIds.includes(row.id);
      if (!isCollapsed && !!row.children?.length) {
        const matchedChildren = row.children.reduce(filterRows, []);
        if (matchedChildren.length > 0) {
          return acc.concat([[row, matchedChildren]]);
        }
      }

      return acc;
    },
    [filter, collapsedIds],
  );

  // Flatten + component-ize the sorted rows.
  let [headerRows, filteredRows]: [RowTuple<R>[], RowTuple<R>[]] = useMemo(() => {
    function makeRowComponent(row: GridDataRow<R>, level: number): JSX.Element {
      // We only pass sortState to header rows, b/c non-headers rows shouldn't have to re-render on sorting
      // changes, and so by not passing the sortProps, it means the data rows' React.memo will still cache them.
      const sortProps = row.kind === "header" ? { sorting, sortState, setSortKey } : { sorting };
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
            openCards: nestedCards ? nestedCards.currentOpenCards() : undefined,
            columnSizes,
            level,
            getCount,
            api,
            ...sortProps,
          }}
        />
      );
    }

    // Split out the header rows from the data rows so that we can put an `infoMessage` in between them (if needed).
    const headerRows: RowTuple<R>[] = [];
    const filteredRows: RowTuple<R>[] = [];

    // Misc state to track our nested card-ification, i.e. interleaved actual rows + chrome rows
    const nestedCards = !!style.nestedCards && new NestedCards(columns, filteredRows, style.nestedCards);

    function visit(row: ParentChildrenTuple<R>, level: number): void {
      let isCard = nestedCards && nestedCards.maybeOpenCard(row[0]);
      filteredRows.push([row[0], makeRowComponent(row[0], level)]);

      const isCollapsed = collapsedIds.includes(row[0].id);
      if (!isCollapsed && row[1].length) {
        nestedCards && nestedCards.addSpacer();
        visitRows(row[1], isCard, level + 1);
      }

      !isLeafRow(row[0]) && isCard && nestedCards && nestedCards.closeCard();
    }

    function visitRows(rows: ParentChildrenTuple<R>[], addSpacer: boolean, level: number): void {
      const length = rows.length;
      rows.forEach((row, i) => {
        if (row[0].kind === "header") {
          headerRows.push([row[0], makeRowComponent(row[0], level)]);
          return;
        }
        visit(row, level);
        addSpacer && nestedCards && i !== length - 1 && nestedCards.addSpacer();
      });
    }

    // Call `visitRows` with our a pre-filtered set list
    // If nestedCards is set, we assume the top-level kind is a card, and so should add spacers between them
    visitRows(maybeSorted.reduce(filterRows, []), !!nestedCards, 0);
    nestedCards && nestedCards.done();

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
    observeRows,
    columnSizes,
    collapsedIds,
    getCount,
  ]);

  let tooManyClientSideRows = false;
  if (filterMaxRows && filteredRows.length > filterMaxRows) {
    tooManyClientSideRows = true;
    filteredRows = filteredRows.slice(0, filterMaxRows);
  }
  rowState.visibleRows.replace(filteredRows.map(([row]) => row?.id ?? ""));

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

  const borderless = style?.presentationSettings?.borderless;
  const typeScale = style?.presentationSettings?.typeScale;
  const fieldProps: PresentationFieldProps = useMemo(
    () => ({
      hideLabel: true,
      numberAlignment: "right",
      compact: true,
      // Avoid passing `undefined` as it will unset existing PresentationContext settings
      ...(borderless !== undefined ? { borderless } : {}),
      ...(typeScale !== undefined ? { typeScale } : {}),
    }),
    [borderless, typeScale],
  );

  // If we're running in Jest, force using `as=div` b/c jsdom doesn't support react-virtuoso.
  // This enables still putting the application's business/rendering logic under test, and letting it
  // just trust the GridTable impl that, at runtime, `as=virtual` will (other than being virtualized)
  // behave semantically the same as `as=div` did for its tests.
  const _as = as === "virtual" && runningInJest ? "div" : as;
  const rowStateContext = useMemo(() => ({ rowState }), [rowState]);
  return (
    <RowStateContext.Provider value={rowStateContext}>
      <PresentationProvider fieldProps={fieldProps} wrap={style?.presentationSettings?.wrap}>
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
          tableRef,
        )}
      </PresentationProvider>
    </RowStateContext.Provider>
  );
}

// Determine which HTML element to use to build the GridTable
const renders: Record<RenderAs, typeof renderTable> = {
  table: renderTable,
  div: renderDiv,
  virtual: renderVirtual,
};

/** Renders table using divs with flexbox rows, which is the default render */
function renderDiv<R extends Kinded>(
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
  tableRef: MutableRefObject<HTMLElement | null>,
): ReactElement {
  return (
    <div
      ref={tableRef as any}
      css={{
        /*
          Using (n + 3) here to target all rows that are after the first non-header row. Since n starts at 0, we can use
          the + operator as an offset.
          Inspired by: https://stackoverflow.com/a/25005740/2551333
        */
        ...(style.betweenRowsCss ? Css.addIn(`& > div:nth-of-type(n+3) > *`, style.betweenRowsCss).$ : {}),
        ...(style.firstNonHeaderRowCss ? Css.addIn(`& > div:nth-of-type(2) > *`, style.firstNonHeaderRowCss).$ : {}),
        ...style.rootCss,
        ...(style.minWidthPx ? Css.mwPx(style.minWidthPx).$ : {}),
        ...xss,
      }}
      data-testid={id}
    >
      {headerRows.map(([, node]) => node)}
      {/* Show an info message if it's set. */}
      {firstRowMessage && (
        <div css={{ ...style.firstRowMessageCss }} data-gridrow>
          {firstRowMessage}
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
  tableRef: MutableRefObject<HTMLElement | null>,
): ReactElement {
  return (
    <table
      ref={tableRef as any}
      css={{
        ...Css.w100.add("borderCollapse", "collapse").$,
        ...Css.addIn("& > tbody > tr ", style.betweenRowsCss || {})
          // removes border between header and second row
          .addIn("& > tbody > tr:first-of-type", style.firstNonHeaderRowCss || {}).$,
        ...style.rootCss,
        ...(style.minWidthPx ? Css.mwPx(style.minWidthPx).$ : {}),
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
  tableRef: MutableRefObject<HTMLElement | null>,
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
      scrollerRef={(ref) => {
        // This is fired multiple times per render. Only set `tableRef.current` if it has changed
        if (ref && tableRef.current !== ref) {
          tableRef.current = ref as HTMLElement;
        }
      }}
      components={{
        List: VirtualRoot(listStyle, columns, id, firstLastColumnWidth, xss),
        Footer: () => <div css={footerStyle} />,
      }}
      // Pin/sticky both the header row(s) + firstRowMessage to the top
      topItemCount={(stickyHeader ? headerRows.length : 0) + (firstRowMessage ? 1 : 0)}
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
 * - Customize the list wrapper to our styles
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
        style={{ ...style, ...{ minWidth: "fit-content" } }}
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
          ...(gs.minWidthPx ? Css.mwPx(gs.minWidthPx).$ : {}),
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
 * Calculates column widths using a flexible `calc()` definition that allows for consistent column alignment without the use of `<table />`, CSS Grid, etc layouts.
 * Enforces only fixed-sized units (% and px)
 */
export function calcColumnSizes(
  columns: GridColumn<any>[],
  firstLastColumnWidth: number | undefined,
  tableWidth: number | undefined,
  tableMinWidthPx: number = 0,
): string[] {
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
        throw new Error("Beam Table column width definition only supports px, percentage, or fr units");
      }
    },
    { claimedPercentages: 0, claimedPixels: 0, totalFr: 0 },
  );

  // This is our "fake but for some reason it lines up better" fr calc
  function fr(myFr: number): string {
    // If the tableWidth, then return a pixel value
    if (tableWidth) {
      const widthBasis = Math.max(tableWidth, tableMinWidthPx);
      // When the tableWidth is defined, then we need to account for the `firstLastColumnWidth`s.
      return `(${
        (widthBasis - (claimedPercentages / 100) * widthBasis - claimedPixels - (firstLastColumnWidth ?? 0) * 2) *
        (myFr / totalFr)
      }px)`;
    }
    // Otherwise return the `calc()` value
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
        throw new Error("Beam Table column width definition only supports px, percentage, or fr units");
      }
    } else {
      return fr(w);
    }
  });

  // If we're doing nested cards, we add extra 1st/last cells...
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
    | GridCellContent
    | (DiscriminateUnion<R, "kind", K> extends { data: infer D }
        ? (data: D, row: GridRowKind<R, K>, api: GridTableApi<R>) => ReactNode | GridCellContent
        : (row: GridRowKind<R, K>, api: GridTableApi<R>) => ReactNode | GridCellContent);
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
};

export const nonKindGridColumnKeys = ["w", "mw", "align", "clientSideSort", "serverSideSortKey"];

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
  onClick?: (row: GridDataRow<R>, api: GridTableApi<R>) => void;
}

function getIndentationCss<R extends Kinded>(
  style: GridStyle,
  rowStyle: RowStyle<R> | undefined,
  columnIndex: number,
  maybeContent: ReactNode | GridCellContent,
): Properties {
  // Look for cell-specific indent or row-specific indent (row-specific is only one the first column)
  const indent = (isGridCellContent(maybeContent) && maybeContent.indent) || (columnIndex === 0 && rowStyle?.indent);
  if (typeof indent === "number" && style.levels !== undefined) {
    throw new Error(
      "The indent param is deprecated for new beam fixed & flexible styles, use beamNestedFixedStyle or beamNestedFlexibleStyle",
    );
  }
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
  /** Allows the cell to stay in place when the user scrolls horizontally */
  sticky?: "left" | "right";
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
} & IfAny<R, {}, DiscriminateUnion<R, "kind", R["kind"]>>;

// Use IfAny so that GridDataRow<any> doesn't devolve into any
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

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
  columnSizes: string[];
  level: number;
  getCount: (id: string) => object;
  api: MutableRefObject<GridTableApi<R>>;
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
    level,
    getCount,
    api,
    ...others
  } = props;

  const { rowState } = useContext(RowStateContext);
  const isActive = useComputed(() => rowState.activeRowId === `${row.kind}_${row.id}`, [row, rowState]);

  // We treat the "header" kind as special for "good defaults" styling
  const isHeader = row.kind === "header";
  const rowStyle = rowStyles?.[row.kind];
  const Row = as === "table" ? "tr" : "div";

  const openCardStyles =
    typeof openCards === "string"
      ? openCards
          .split(":")
          .map((openCardKind) => style.nestedCards!.kinds[openCardKind])
          .filter((style) => style)
      : undefined;

  const rowStyleCellCss = maybeApplyFunction(row as any, rowStyle?.cellCss);
  const rowCss = {
    // For virtual tables use `display: flex` to keep all cells on the same row. For each cell in the row use `flexNone` to ensure they stay their defined widths
    ...(as === "table" ? {} : Css.relative.df.fg1.fs1.addIn("&>*", Css.flexNone.$).$),
    ...((rowStyle?.rowLink || rowStyle?.onClick) && {
      // Even though backgroundColor is set on the cellCss, the hover target is the row.
      "&:hover > *": Css.cursorPointer.bgColor(style.rowHoverColor ?? Palette.LightBlue100).$,
    }),
    ...maybeApplyFunction(row as any, rowStyle?.rowCss),
    // Maybe add the sticky header styles
    ...(isHeader && stickyHeader ? Css.sticky.top(stickyOffset).z2.$ : undefined),
    ...getNestedCardStyles(row, openCardStyles, style, isActive),
  };

  let currentColspan = 1;

  const rowNode = (
    <Row css={rowCss} {...others} data-gridrow {...getCount(row.id)}>
      {columns.map((column, columnIndex) => {
        const { wrapAction = true } = column;

        if (column.mw) {
          // Validate the column's minWidth definition if set.
          if (!column.mw.endsWith("px") && !column.mw.endsWith("%")) {
            throw new Error("Beam Table column min-width definition only supports px or percentage values");
          }
        }

        // Decrement colspan count and skip if greater than 1.
        if (currentColspan > 1) {
          currentColspan -= 1;
          return null;
        }
        const maybeContent = applyRowFn(column, row, api);
        currentColspan = isGridCellContent(maybeContent) ? maybeContent.colspan ?? 1 : 1;

        const canSortColumn =
          (sorting?.on === "client" && column.clientSideSort !== false) ||
          (sorting?.on === "server" && !!column.serverSideSortKey);
        const alignment = getAlignment(column, maybeContent);
        const justificationCss = getJustification(column, maybeContent, as, alignment);
        const content = toContent(
          maybeContent,
          isHeader,
          canSortColumn,
          sorting?.on === "client",
          style,
          as,
          alignment,
        );

        ensureClientSideSortValueIsSortable(sorting, isHeader, column, columnIndex, maybeContent);
        const maybeNestedCardColumnIndex = columnIndex + (style.nestedCards ? 1 : 0);

        const maybeSticky = ((isGridCellContent(maybeContent) && maybeContent.sticky) || column.sticky) ?? undefined;
        const maybeStickyColumnStyles =
          maybeSticky && columnSizes
            ? {
                ...Css.sticky.z1.$,
                // Need to apply a background to this cell to avoid content beneath it being shown when sticky.
                // Assumes background is white for non-nestedCard styles. This can be overridden via cellCss.
                ...(style.nestedCards?.kinds
                  ? Css.bgColor(getCurrentBgColor(row, openCardStyles, style.nestedCards.kinds)).$
                  : Css.bgWhite.$),
                ...(maybeSticky === "left"
                  ? Css.left(
                      maybeNestedCardColumnIndex === 0
                        ? 0
                        : `calc(${columnSizes.slice(0, maybeNestedCardColumnIndex).join(" + ")})`,
                    ).$
                  : {}),
                ...(maybeSticky === "right"
                  ? Css.right(
                      maybeNestedCardColumnIndex + 1 === columnSizes.length
                        ? 0
                        : `calc(${columnSizes.slice(maybeNestedCardColumnIndex + 1 - columnSizes.length).join(" + ")})`,
                    ).$
                  : {}),
              }
            : {};

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
          // Apply sticky column/cell styles
          ...maybeStickyColumnStyles,
          // Apply any static/all-cell styling
          ...style.cellCss,
          // Then override with first/last cell styling
          ...getFirstOrLastCellCss(style, columnIndex, columns),
          // Then override with per-cell/per-row justification/indentation
          ...justificationCss,
          ...getIndentationCss(style, rowStyle, columnIndex, maybeContent),
          // Then apply any header-specific override
          ...(isHeader && style.headerCellCss),
          // Or level-specific styling
          ...(!isHeader && !!style.levels && style.levels[level]?.cellCss),
          // The specific cell's css (if any from GridCellContent)
          ...rowStyleCellCss,
          // Apply active row styling for non-nested card styles.
          ...(style.nestedCards === undefined && isActive
            ? Css.bgColor(style.activeBgColor ?? Palette.LightBlue50).$
            : {}),
          // Add any cell specific style overrides
          ...(isGridCellContent(maybeContent) && maybeContent.typeScale ? Css[maybeContent.typeScale].$ : {}),
          // Define the width of the column on each cell. Supports col spans.
          ...{
            width: `calc(${columnSizes
              .slice(maybeNestedCardColumnIndex, maybeNestedCardColumnIndex + currentColspan)
              .join(" + ")})`,
          },
          ...(column.mw ? Css.mw(column.mw).$ : {}),
        };

        const renderFn: RenderCellFn<any> =
          (rowStyle?.renderCell || rowStyle?.rowLink) && wrapAction
            ? rowLinkRenderFn(as)
            : isHeader
            ? headerRenderFn(columns, column, sortState, setSortKey, as)
            : rowStyle?.onClick && wrapAction
            ? rowClickRenderFn(as, api)
            : defaultRenderFn(as);

        return renderFn(columnIndex, cellCss, content, row, rowStyle);
      })}
    </Row>
  );

  return openCardStyles && openCardStyles.length > 0 ? wrapCard(openCardStyles, rowNode) : rowNode;
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
  alignment: GridCellAlignment,
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
    return <SortHeader content={content} iconOnLeft={alignment === "right"} />;
  } else if (content && typeof content === "string" && style?.presentationSettings?.wrap === false) {
    return (
      <span css={Css.mw0.truncate.$} title={content}>
        {content}
      </span>
    );
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
export function applyRowFn<R extends Kinded>(
  column: GridColumn<R>,
  row: GridDataRow<R>,
  api: MutableRefObject<GridTableApi<R>>,
): ReactNode | GridCellContent {
  // Usually this is a function to apply against the row, but sometimes it's a hard-coded value, i.e. for headers
  const maybeContent = column[row.kind];
  if (typeof maybeContent === "function") {
    if ("data" in row && "id" in row) {
      // Auto-destructure data
      return (maybeContent as Function)((row as any)["data"], (row as any)["id"], api.current);
    } else {
      return (maybeContent as Function)(row, api.current);
    }
  } else {
    return maybeContent;
  }
}

/** Renders our default cell element, i.e. if no row links and no custom renderCell are used. */
const defaultRenderFn: (as: RenderAs) => RenderCellFn<any> = (as: RenderAs) => (key, css, content) => {
  const Cell = as === "table" ? "td" : "div";
  return (
    <Cell key={key} css={{ ...css, ...tableRowStyles(as) }}>
      {content}
    </Cell>
  );
};

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
const rowClickRenderFn: (as: RenderAs, api: MutableRefObject<GridTableApi<any>>) => RenderCellFn<any> =
  (as: RenderAs, api: MutableRefObject<GridTableApi<any>>) => (key, css, content, row, rowStyle) => {
    const Row = as === "table" ? "tr" : "div";
    return (
      <Row {...{ key }} css={{ ...css, ...tableRowStyles(as) }} onClick={() => rowStyle!.onClick!(row, api.current)}>
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

function getAlignment(column: GridColumn<any>, maybeContent: ReactNode | GridCellContent): GridCellAlignment {
  return (isGridCellContent(maybeContent) && maybeContent.alignment) || column.align || "left";
}

// For alignment, use: 1) cell def, else 2) column def, else 3) left.
function getJustification(
  column: GridColumn<any>,
  maybeContent: ReactNode | GridCellContent,
  as: RenderAs,
  alignment: GridCellAlignment,
) {
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

/** GridTable as Table utility to apply <tr> element override styles. */
function tableRowStyles(as: RenderAs, column?: GridColumn<any>) {
  const thWidth = column?.w;
  return as === "table"
    ? {
        ...Css.dtc.$,
        ...(thWidth ? Css.w(thWidth).$ : {}),
      }
    : {};
}
