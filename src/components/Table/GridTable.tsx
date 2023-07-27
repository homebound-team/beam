import memoizeOne from "memoize-one";
import { toJS } from "mobx";
import React, { MutableRefObject, ReactElement, useEffect, useMemo, useRef } from "react";
import { Components, Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { PresentationFieldProps, PresentationProvider } from "src/components/PresentationContext";
import { GridTableApi, GridTableApiImpl } from "src/components/Table/GridTableApi";
import { useSetupColumnSizes } from "src/components/Table/hooks/useSetupColumnSizes";
import { defaultStyle, GridStyle, GridStyleDef, resolveStyles, RowStyles } from "src/components/Table/TableStyles";
import {
  Direction,
  GridColumn,
  GridColumnWithId,
  GridTableXss,
  InfiniteScroll,
  Kinded,
  ParentChildrenTuple,
  RenderAs,
  RowTuple,
} from "src/components/Table/types";
import { assignDefaultColumnIds } from "src/components/Table/utils/columns";
import { createRowLookup, GridRowLookup } from "src/components/Table/utils/GridRowLookup";
import { sortRows } from "src/components/Table/utils/sortRows";
import { TableStateContext } from "src/components/Table/utils/TableState";
import {
  applyRowFn,
  EXPANDABLE_HEADER,
  KEPT_GROUP,
  matchesFilter,
  reservedRowKinds,
  zIndices,
} from "src/components/Table/utils/utils";
import { Css, Only } from "src/Css";
import { useComputed } from "src/hooks";
import { useRenderCount } from "src/hooks/useRenderCount";
import { GridDataRow, Row } from "./components/Row";

let runningInJest = false;

/** Tells GridTable we're running in Jest, which forces as=virtual to be as=div, to work in jsdom. */
export function setRunningInJest() {
  runningInJest = true;
}

export interface GridTableDefaults {
  style: GridStyle | GridStyleDef;
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
export type GridSortConfig =
  | {
      on: "client";
      /** The optional initial column (index in columns) and direction to sort. */
      initial?: [string, Direction] | undefined;
      caseSensitive?: boolean;
      /** The optional primary sort column, this will be sorted first above/below table sort  */
      primary?: [string, Direction] | undefined;
    }
  | {
      on: "server";
      /** The current sort by value + direction (if server-side sorting). */
      value?: [string, Direction];
      /** Callback for when the column is sorted (if server-side sorting). Parameters set to `undefined` is a signal to return to the initial sort state */
      onSort: (orderBy: string | undefined, direction: Direction | undefined) => void;
    };

export interface GridTableProps<R extends Kinded, X> {
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
  columns: GridColumn<R>[];
  /** The rows of data (including any header/footer rows), to be rendered by the column definitions. */
  rows: GridDataRow<R>[];
  /** Optional row-kind-level styling / behavior like onClick/rowLinks. */
  rowStyles?: RowStyles<R>;
  /** Allow looking up prev/next of a row i.e. for SuperDrawer navigation. */
  rowLookup?: MutableRefObject<GridRowLookup<R> | undefined>;
  /** Whether the header row should be sticky. */
  stickyHeader?: boolean;
  stickyOffset?: number;
  /** Configures sorting via a hash, does not need to be stable. */
  sorting?: GridSortConfig;
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
  /** A combination of CSS settings to set the static look & feel (vs. rowStyles which is per-row styling). */
  style?: GridStyle | GridStyleDef;
  /**
   * If provided, collapsed rows on the table persists when the page is reloaded.
   *
   * This key should generally be unique to the page it's on, i.e. `specsTable_p:1_precon` would
   *  be the collapsed state for project `p:1`'s precon stage specs & selections table.
   */
  persistCollapse?: string;
  xss?: X;
  /** Accepts the api, from `useGridTableApi`, that the caller wants to use for this table. */
  api?: GridTableApi<R>;
  /** Experimental, expecting to be removed - Specify the element in which the table should resize its columns against. If not set, the table will resize columns based on its owns container's width */
  resizeTarget?: MutableRefObject<HTMLElement | null>;
  /**
   * Defines which row in the table should be provided with an "active" styling.
   * Expected format is `${row.kind}_${row.id}`. This helps avoid id conflicts between rows of different types/kinds that may have the same id.
   * Example "data_123"
   */
  activeRowId?: string;
  /**
   * Defines which cell in the table should be provided with an "active" styling.
   * Expected format is `${row.kind}_${row.id}_${column.id}`.
   */
  activeCellId?: string;
  /**
   * Defines the session storage key for which columns are visible. If not provided, a default storage key will be used based on column order and/or `GridColumn.id`
   * This is beneficial when looking at the same table, but of a different subject (i.e. Project A's PreCon Schedule vs Project A's Construction schedule)
   */
  visibleColumnsStorageKey?: string;
  /**
   * Infinite scroll is only supported with `as=virtual` mode
   *
   ** `onEndReached` will be called when the user scrolls to the end of the list with the last item index as an argument.
   ** `endOffsetPx` is the number of pixels from the bottom of the list to eagerly trigger `onEndReached`. The default is is 500px.
   */
  infiniteScroll?: InfiniteScroll;
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
 * In a "kind" of cute way, headers are not modeled specially, i.e. they are just another
 * row `kind` along with the data rows. (Admittedly, out of pragmatism, we do apply some
 * special styling to the row that uses `kind: "header"`.)
 *
 * For some rationale of our current/historical rendering approaches, see the following doc:
 *
 * https://docs.google.com/document/d/1DFnlkDubK4nG_GLf_hB8yp0flnSNt_3IBh5iOicuaFM/edit#heading=h.9m9cpwgeqfc9
 */
export function GridTable<R extends Kinded, X extends Only<GridTableXss, X> = any>(props: GridTableProps<R, X>) {
  const {
    id = "gridTable",
    as = "div",
    columns: _columns,
    rows,
    style: maybeStyle = defaults.style,
    rowStyles,
    stickyHeader = defaults.stickyHeader,
    stickyOffset = 0,
    xss,
    filter,
    filterMaxRows,
    fallbackMessage = "No rows found.",
    infoMessage,
    setRowCount,
    persistCollapse,
    resizeTarget,
    activeRowId,
    activeCellId,
    visibleColumnsStorageKey,
    infiniteScroll,
  } = props;

  const columnsWithIds = useMemo(() => assignDefaultColumnIds(_columns), [_columns]);

  // We only use this in as=virtual mode, but keep this here for rowLookup to use
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  // Use this ref to watch for changes in the GridTable's container and resize columns accordingly.
  const resizeRef = useRef<HTMLDivElement>(null);

  const api = useMemo<GridTableApiImpl<R>>(() => {
    const api = (props.api as GridTableApiImpl<R>) ?? new GridTableApiImpl();
    api.init(persistCollapse, virtuosoRef, rows);
    api.setActiveRowId(activeRowId);
    api.setActiveCellId(activeCellId);
    return api;
  }, [props.api]);

  const style = resolveStyles(maybeStyle);
  const { tableState } = api;

  tableState.setRows(rows);
  tableState.setColumns(columnsWithIds, visibleColumnsStorageKey);
  const columns: GridColumnWithId<R>[] = useComputed(
    () =>
      tableState.columns
        .filter((c) => tableState.visibleColumnIds.includes(c.id))
        .flatMap((c) =>
          c.expandColumns && tableState.expandedColumnIds.includes(c.id)
            ? [c, ...tableState.getExpandedColumns(c)]
            : [c],
        ) as GridColumnWithId<R>[],
    [tableState],
  );

  // Initialize the sort state. This will only happen on the first render.
  // Once the `TableState.sort` is defined, it will not re-initialize.
  tableState.initSortState(props.sorting, columns);

  const [sortOn, caseSensitive] = useComputed(() => {
    const { sortConfig } = tableState;
    return [sortConfig?.on, sortConfig?.on === "client" ? !!sortConfig.caseSensitive : false];
  }, [tableState]);

  useEffect(() => {
    tableState.activeRowId = activeRowId;
  }, [tableState, activeRowId]);

  useEffect(() => {
    tableState.activeCellId = activeCellId;
  }, [tableState, activeCellId]);

  // We track render count at the table level, which seems odd (we should be able to track this
  // internally within each GridRow using a useRef), but we have suspicions that react-virtuoso
  // (or us) is resetting component state more than necessary, so we track render counts from
  // here instead.
  const { getCount } = useRenderCount();

  const expandedColumnIds: string[] = useComputed(() => tableState.expandedColumnIds, [tableState]);
  const columnSizes = useSetupColumnSizes(style, columns, resizeTarget ?? resizeRef, expandedColumnIds);

  // Make a single copy of our current collapsed state, so we'll have a single observer.
  const collapsedIds = useComputed(() => tableState.collapsedIds, [tableState]);
  const sortState = useComputed(() => toJS(tableState.sortState), [tableState]);

  const maybeSorted = useMemo(() => {
    if (sortOn === "client" && sortState) {
      // If using client-side sort, the sortState use S = number
      return sortRows(columns, rows, sortState, caseSensitive);
    }
    return rows;
  }, [columns, rows, sortOn, sortState, caseSensitive]);

  const keptDataRows = useComputed(() => tableState.keptRows as GridDataRow<R>[], [tableState]);
  // Sort the `keptSelectedDataRows` separately because the current sorting logic sorts within groups and these "kept" rows are now displayed in a flat list.
  // It could also be the case that some of these rows are no longer in the `props.rows` list, and so wouldn't be sorted by the `maybeSorted` logic above.
  const sortedKeptSelections = useMemo(() => {
    if (sortOn === "client" && sortState && keptDataRows.length > 0) {
      return sortRows(columns, keptDataRows, sortState, caseSensitive);
    }
    return keptDataRows;
  }, [columns, sortOn, sortState, caseSensitive, keptDataRows]);

  // Flatten, hide-if-filtered, hide-if-collapsed, and component-ize the sorted rows.
  let [headerRows, visibleDataRows, totalsRows, expandableHeaderRows, keptSelectedRows, filteredRowIds]: [
    RowTuple<R>[],
    RowTuple<R>[],
    RowTuple<R>[],
    RowTuple<R>[],
    RowTuple<R>[],
    string[],
  ] = useMemo(() => {
    const hasExpandableHeader = maybeSorted.some((row) => row.id === EXPANDABLE_HEADER);
    const makeRowComponent = (
      row: GridDataRow<R>,
      level: number,
      isKeptSelectedRow: boolean = false,
      isLastKeptSelectionRow: boolean = false,
    ) => (
      <Row
        key={`${row.kind}-${row.id}`}
        {...{
          as,
          columns,
          row,
          style,
          rowStyles,
          columnSizes,
          level,
          getCount,
          api,
          cellHighlight: "cellHighlight" in maybeStyle && maybeStyle.cellHighlight === true,
          omitRowHover: "rowHover" in maybeStyle && maybeStyle.rowHover === false,
          hasExpandableHeader,
          isKeptSelectedRow,
          isLastKeptSelectionRow,
        }}
      />
    );

    // Split out the header rows from the data rows so that we can put an `infoMessage` in between them (if needed).
    const headerRows: RowTuple<R>[] = [];
    const expandableHeaderRows: RowTuple<R>[] = [];
    const totalsRows: RowTuple<R>[] = [];
    const visibleDataRows: RowTuple<R>[] = [];
    const keptSelectedRows: RowTuple<R>[] = [];

    // Flatten the tuple tree into lists of rows
    function visitRows(tuples: ParentChildrenTuple<R>[], level: number): void {
      tuples.forEach(([row, children]) => {
        if (row.kind === "header") {
          headerRows.push([row, makeRowComponent(row, level)]);
        } else if (row.kind === "totals") {
          totalsRows.push([row, makeRowComponent(row, level)]);
        } else if (row.kind === "expandableHeader") {
          expandableHeaderRows.push([row, makeRowComponent(row, level)]);
        } else {
          visibleDataRows.push([row, makeRowComponent(row, level)]);
          // tuples has already been client-side filtered, so just check collapsed
          if (children.length && !collapsedIds.includes(row.id)) {
            visitRows(children, level + 1);
          }
        }
      });
    }

    // Call `visitRows` with our post-filtered list
    const [filteredRowIds, filteredRows] = filterRows(api, columns, maybeSorted, filter);
    visitRows(filteredRows, 0);

    // Check for any selected rows that are not displayed in the table because they don't
    // match the current filter, or are no longer part of the `rows` prop. We persist these
    // selected rows and hoist them to the top of the table.
    if (sortedKeptSelections.length) {
      // The "group row" for selected rows that are hidden by filters and add the children
      const keptGroupRow: GridDataRow<any> = {
        id: KEPT_GROUP,
        kind: KEPT_GROUP,
        children: sortedKeptSelections,
        initCollapsed: true,
        data: undefined,
      };

      keptSelectedRows.push(
        [keptGroupRow as GridDataRow<R>, makeRowComponent(keptGroupRow as GridDataRow<R>, 1)],
        ...sortedKeptSelections.map((row, idx) => {
          const isLast = idx === sortedKeptSelections.length - 1;
          return [row, makeRowComponent(row, 1, true, isLast)] as RowTuple<R>;
        }),
      );
    }

    return [headerRows, visibleDataRows, totalsRows, expandableHeaderRows, keptSelectedRows, filteredRowIds];
  }, [
    as,
    api,
    filter,
    maybeSorted,
    columns,
    style,
    rowStyles,
    maybeStyle,
    columnSizes,
    collapsedIds,
    getCount,
    sortedKeptSelections,
  ]);

  // Once our header rows are created we can organize them in expected order.
  const tableHeadRows = expandableHeaderRows.concat(headerRows).concat(totalsRows);

  const tooManyClientSideRows = filterMaxRows && visibleDataRows.length > filterMaxRows;
  if (tooManyClientSideRows) {
    visibleDataRows = visibleDataRows.slice(0, filterMaxRows + keptSelectedRows.length);
  }

  tableState.setMatchedRows(filteredRowIds);

  // Push back to the caller a way to ask us where a row is.
  const { rowLookup } = props;
  if (rowLookup) {
    // Refs are cheap to assign to, so we don't bother doing this in a useEffect
    rowLookup.current = createRowLookup(columns, visibleDataRows, virtuosoRef);
  }

  // TODO: Replace setRowCount with clients observing TableState via the API
  useEffect(() => {
    setRowCount && visibleDataRows?.length !== undefined && setRowCount(visibleDataRows.length);
  }, [visibleDataRows?.length, setRowCount]);

  const noData = visibleDataRows.length === 0;
  const firstRowMessage =
    (noData && fallbackMessage) || (tooManyClientSideRows && "Hiding some rows, use filter...") || infoMessage;

  const borderless = style?.presentationSettings?.borderless;
  const typeScale = style?.presentationSettings?.typeScale;
  const fieldProps: PresentationFieldProps = useMemo(
    () => ({
      labelStyle: "hidden",
      numberAlignment: "right",
      compact: true,
      errorInTooltip: true,
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
  const rowStateContext = useMemo(() => ({ tableState: tableState }), [tableState]);
  return (
    <TableStateContext.Provider value={rowStateContext}>
      <PresentationProvider fieldProps={fieldProps} wrap={style?.presentationSettings?.wrap}>
        {/* If virtualized take some pixels off the width to accommodate when virtuoso's scrollbar is introduced. */}
        {/* Otherwise a horizontal scrollbar will _always_ appear once the vertical scrollbar is needed */}
        <div ref={resizeRef} css={Css.w100.if(as === "virtual").w("calc(100% - 20px)").$} />
        {renders[_as](
          style,
          id,
          columns,
          visibleDataRows,
          keptSelectedRows,
          firstRowMessage,
          stickyHeader,
          xss,
          virtuosoRef,
          tableHeadRows,
          stickyOffset,
          infiniteScroll,
        )}
      </PresentationProvider>
    </TableStateContext.Provider>
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
  columns: GridColumnWithId<R>[],
  visibleDataRows: RowTuple<R>[],
  keptSelectedRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  _virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  tableHeadRows: RowTuple<R>[],
  stickyOffset: number,
  _infiniteScroll?: InfiniteScroll,
): ReactElement {
  return (
    <div
      css={{
        // Use `fit-content` to ensure the width of the table takes up the full width of its content.
        // Otherwise, the table's width would be that of its container, which may not be as wide as the table itself.
        // In cases where we have sticky columns on a very wide table, then the container which the columns "stick" to (which is the table),
        // needs to be as wide as the table's content, or else we lose the "stickiness" once scrolling past width of the table's container.
        ...Css.mw("fit-content").$,
        ...style.rootCss,
        ...(style.minWidthPx ? Css.mwPx(style.minWidthPx).$ : {}),
        ...xss,
      }}
      data-testid={id}
    >
      {/* Table Head */}
      <div
        css={{
          ...(style.firstRowCss && Css.addIn("& > div:first-of-type", style.firstRowCss).$),
          ...Css.if(stickyHeader).sticky.topPx(stickyOffset).z(zIndices.stickyHeader).$,
        }}
      >
        {tableHeadRows.map(([, node]) => node)}
      </div>

      {/* Table Body */}
      <div
        css={{
          ...(style.betweenRowsCss ? Css.addIn(`& > div > *`, style.betweenRowsCss).$ : {}),
          ...(style.firstNonHeaderRowCss ? Css.addIn(`& > div:first-of-type > *`, style.firstNonHeaderRowCss).$ : {}),
          ...(style.lastRowCss && Css.addIn("& > div:last-of-type", style.lastRowCss).$),
        }}
      >
        {keptSelectedRows.map(([, node]) => node)}
        {/* Show an info message if it's set. */}
        {firstRowMessage && (
          <div css={{ ...style.firstRowMessageCss }} data-gridrow>
            {firstRowMessage}
          </div>
        )}
        {visibleDataRows.map(([, node]) => node)}
      </div>
    </div>
  );
}

/** Renders as a table, primarily/solely for good print support. */
function renderTable<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumnWithId<R>[],
  visibleDataRows: RowTuple<R>[],
  keptSelectedRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  _virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  tableHeadRows: RowTuple<R>[],
  stickyOffset: number,
  _infiniteScroll?: InfiniteScroll,
): ReactElement {
  return (
    <table
      css={{
        ...Css.w100.add("borderCollapse", "separate").add("borderSpacing", "0").$,
        ...Css.addIn("& > tbody > tr > * ", style.betweenRowsCss || {})
          // removes border between header and second row
          .addIn("& > tbody > tr:first-of-type > *", style.firstNonHeaderRowCss || {}).$,
        ...Css.addIn("& > tbody > tr:last-of-type", style.lastRowCss).$,
        ...Css.addIn("& > thead > tr:first-of-type", style.firstRowCss).$,
        ...style.rootCss,
        ...(style.minWidthPx ? Css.mwPx(style.minWidthPx).$ : {}),
        ...xss,
      }}
      data-testid={id}
    >
      <thead css={Css.if(stickyHeader).sticky.topPx(stickyOffset).z(zIndices.stickyHeader).$}>
        {tableHeadRows.map(([, node]) => node)}
      </thead>
      <tbody>
        {keptSelectedRows.map(([, node]) => node)}
        {/* Show an all-column-span info message if it's set. */}
        {firstRowMessage && (
          <tr>
            <td colSpan={columns.length} css={{ ...style.firstRowMessageCss }}>
              {firstRowMessage}
            </td>
          </tr>
        )}
        {visibleDataRows.map(([, node]) => node)}
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
  columns: GridColumnWithId<R>[],
  visibleDataRows: RowTuple<R>[],
  keptSelectedRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  tableHeadRows: RowTuple<R>[],
  _stickyOffset: number,
  infiniteScroll?: InfiniteScroll,
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
        // Applying a zIndex: 2 to ensure it stays on top of sticky columns
        TopItemList: React.forwardRef((props, ref) => (
          <div
            {...props}
            ref={ref as MutableRefObject<HTMLDivElement>}
            style={{ ...props.style, ...{ zIndex: zIndices.stickyHeader } }}
          />
        )),
        List: VirtualRoot(listStyle, columns, id, xss),
        Footer: () => <div css={footerStyle} />,
      }}
      // Pin/sticky both the header row(s) + firstRowMessage to the top
      topItemCount={stickyHeader ? tableHeadRows.length : 0}
      itemContent={(index) => {
        // Since we have 3 arrays of rows: `tableHeadRows` and `visibleDataRows` and `keptSelectedRows` we must determine which one to render.

        if (index < tableHeadRows.length) {
          return tableHeadRows[index][1];
        }

        // Reset index
        index -= tableHeadRows.length;

        // Show keptSelectedRows if there are any
        if (index < keptSelectedRows.length) {
          return keptSelectedRows[index][1];
        }

        // Reset index
        index -= keptSelectedRows.length;

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

        // Lastly render the table body rows
        return visibleDataRows[index][1];
      }}
      totalCount={tableHeadRows.length + (firstRowMessage ? 1 : 0) + visibleDataRows.length + keptSelectedRows.length}
      // When implementing infinite scroll, default the bottom `increaseViewportBy` to 500px. This creates the "infinite"
      // effect such that the next page of data is (hopefully) loaded before the user reaches the true bottom
      // Spreading these props due to virtuoso erroring when `increaseViewportBy` is undefined
      {...(infiniteScroll
        ? {
            increaseViewportBy: {
              bottom: infiniteScroll.endOffsetPx ?? 500,
              top: 0,
            },
            endReached: infiniteScroll.onEndReached,
          }
        : {})}
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
const VirtualRoot = memoizeOne<(gs: GridStyle, columns: GridColumn<any>[], id: string, xss: any) => Components["List"]>(
  (gs, _columns, id, xss) => {
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
              ? Css.addIn("& > div:first-of-type > *", gs.firstRowCss).$
              : {
                  ...Css.addIn("& > div:first-of-type > *", gs.firstNonHeaderRowCss).$,
                  ...Css.addIn("& > div:last-of-type > *", gs.lastRowCss).$,
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
  },
);

/**
 * Filters rows given a client-side text `filter.
 *
 * Ensures parent rows remain in the list if any children match the filter.
 *
 * We return a copy of `[Parent, [Child]]` tuples so that we don't modify the `GridDataRow.children`.
 */
export function filterRows<R extends Kinded>(
  api: GridTableApi<R>,
  columns: GridColumnWithId<R>[],
  rows: GridDataRow<R>[],
  filter: string | undefined,
): [string[], ParentChildrenTuple<R>[]] {
  // Make a flat list of ids, in addition to the tuple tree
  const filteredRowIds: string[] = [];
  // Break up "foo bar" into `[foo, bar]` and a row must match both `foo` and `bar`
  const filters = (filter && filter.split(/ +/)) || [];

  // Make a functions to do recursion
  function acceptAll(acc: ParentChildrenTuple<R>[], row: GridDataRow<R>): ParentChildrenTuple<R>[] {
    filteredRowIds.push(row.id);
    return acc.concat([[row, row.children?.reduce(acceptAll, []) ?? []]]);
  }

  function filterFn(acc: ParentChildrenTuple<R>[], row: GridDataRow<R>): ParentChildrenTuple<R>[] {
    const matches =
      reservedRowKinds.includes(row.kind) ||
      filters.length === 0 ||
      filters.every((f) =>
        columns.map((c) => applyRowFn(c, row, api, 0, false)).some((maybeContent) => matchesFilter(maybeContent, f)),
      );
    if (matches) {
      filteredRowIds.push(row.id);
      // A matched parent means show all it's children
      return acc.concat([[row, row.children?.reduce(acceptAll, []) ?? []]]);
    } else {
      // An unmatched parent but with matched children means show the parent
      const matchedChildren = row.children?.reduce(filterFn, []) ?? [];
      if (
        matchedChildren.length > 0 ||
        typeof row.pin === "string" ||
        (row.pin !== undefined && row.pin.filter !== true)
      ) {
        filteredRowIds.push(row.id);
        return acc.concat([[row, matchedChildren]]);
      } else {
        return acc;
      }
    }
  }

  return [filteredRowIds, rows.reduce(filterFn, [])];
}
