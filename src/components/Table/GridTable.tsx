import memoizeOne from "memoize-one";
import { runInAction } from "mobx";
import React, { MutableRefObject, ReactElement, useEffect, useMemo, useRef } from "react";
import { Components, Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { Loader } from "src/components";
import { DiscriminateUnion, GridRowKind } from "src/components/index";
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
  RenderAs,
} from "src/components/Table/types";
import { assignDefaultColumnIds } from "src/components/Table/utils/columns";
import { GridRowLookup } from "src/components/Table/utils/GridRowLookup";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { EXPANDABLE_HEADER, KEPT_GROUP, zIndices } from "src/components/Table/utils/utils";
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

/** Allows listening to per-kind row selection changes. */
export type OnRowSelect<R extends Kinded> = {
  [K in R["kind"]]?: DiscriminateUnion<R, "kind", K> extends { data: infer D }
    ? (data: D, isSelected: boolean, opts: { row: GridRowKind<R, K>; api: GridTableApi<R> }) => void
    : (data: undefined, isSelected: boolean, opts: { row: GridRowKind<R, K>; api: GridTableApi<R> }) => void;
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
  /** Callback for when a row is selected or unselected. */
  onRowSelect?: OnRowSelect<R>;
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
    persistCollapse,
    resizeTarget,
    activeRowId,
    activeCellId,
    visibleColumnsStorageKey,
    infiniteScroll,
    onRowSelect,
  } = props;

  const columnsWithIds = useMemo(() => assignDefaultColumnIds(_columns), [_columns]);

  // We only use this in as=virtual mode, but keep this here for rowLookup to use
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  // Use this ref to watch for changes in the GridTable's container and resize columns accordingly.
  const resizeRef = useRef<HTMLDivElement>(null);

  const api = useMemo<GridTableApiImpl<R>>(() => {
    // Let the user pass in their own api handle, otherwise make our own
    const api = (props.api as GridTableApiImpl<R>) ?? new GridTableApiImpl();
    api.init(persistCollapse, virtuosoRef);
    api.setActiveRowId(activeRowId);
    api.setActiveCellId(activeCellId);
    // Push the initial columns directly into tableState, b/c that is what
    // makes the tests pass, but then further updates we'll do through useEffect
    // to avoid "Cannot update component during render" errors.
    api.tableState.setColumns(columnsWithIds, visibleColumnsStorageKey);
    return api;
  }, [props.api]);

  const style = resolveStyles(maybeStyle);
  const { tableState } = api;

  tableState.onRowSelect = onRowSelect;

  // Use a single useEffect to push props into the TableState observable, that
  // way we avoid React warnings when the observable mutations cause downstream
  // components to be marked for re-render. Mobx will ignore setter calls that
  // don't actually change the value, so we can do this in a single useEffect.
  useEffect(() => {
    // Use runInAction so mobx delays any reactions until all the mutations happen
    runInAction(() => {
      tableState.setRows(rows);
      tableState.setColumns(columnsWithIds, visibleColumnsStorageKey);
      tableState.setSearch(filter);
      tableState.activeRowId = activeRowId;
      tableState.activeCellId = activeCellId;
    });
  }, [tableState, rows, columnsWithIds, visibleColumnsStorageKey, activeRowId, activeCellId, filter]);

  const columns: GridColumnWithId<R>[] = useComputed(() => {
    return tableState.visibleColumns as GridColumnWithId<R>[];
  }, [tableState]);

  // Initialize the sort state. This will only happen on the first render.
  // Once the `TableState.sort` is defined, it will not re-initialize.
  tableState.initSortState(props.sorting, columns);

  // We track render count at the table level, which seems odd (we should be able to track this
  // internally within each GridRow using a useRef), but we have suspicions that react-virtuoso
  // (or us) is resetting component state more than necessary, so we track render counts from
  // here instead.
  const { getCount } = useRenderCount();

  // Our column sizes use either `w` or `expandedWidth`, so see which columns are currently expanded
  const expandedColumnIds: string[] = useComputed(() => tableState.expandedColumnIds, [tableState]);
  const columnSizes = useSetupColumnSizes(style, columns, resizeTarget ?? resizeRef, expandedColumnIds);

  // Flatten, hide-if-filtered, hide-if-collapsed, and component-ize the sorted rows.
  const [tableHeadRows, visibleDataRows, keptSelectedRows, tooManyClientSideRows]: [
    ReactElement[],
    ReactElement[],
    ReactElement[],
    boolean,
  ] = useComputed(() => {
    // Split out the header rows from the data rows so that we can put an `infoMessage` in between them (if needed).
    const headerRows: ReactElement[] = [];
    const expandableHeaderRows: ReactElement[] = [];
    const totalsRows: ReactElement[] = [];
    const keptSelectedRows: ReactElement[] = [];
    let visibleDataRows: ReactElement[] = [];

    const { visibleRows } = tableState;
    const hasExpandableHeader = visibleRows.some((rs) => rs.row.id === EXPANDABLE_HEADER);

    // Get the flat list or rows from the header down...
    visibleRows.forEach((rs) => {
      const row = (
        <Row
          key={rs.key}
          {...{
            as,
            rs,
            style,
            rowStyles,
            columnSizes,
            getCount,
            cellHighlight: "cellHighlight" in maybeStyle && maybeStyle.cellHighlight === true,
            omitRowHover: "rowHover" in maybeStyle && maybeStyle.rowHover === false,
            hasExpandableHeader,
          }}
        />
      );
      if (rs.kind === "header") {
        headerRows.push(row);
      } else if (rs.kind === "expandableHeader") {
        expandableHeaderRows.push(row);
      } else if (rs.kind === "totals") {
        totalsRows.push(row);
      } else if (rs.isKept || rs.kind === KEPT_GROUP) {
        keptSelectedRows.push(row);
      } else {
        visibleDataRows.push(row);
      }
    });

    // Once our header rows are created we can organize them in expected order.
    const tableHeadRows = expandableHeaderRows.concat(headerRows).concat(totalsRows);

    const tooManyClientSideRows = !!filterMaxRows && visibleDataRows.length > filterMaxRows;
    if (tooManyClientSideRows) {
      visibleDataRows = visibleDataRows.slice(0, filterMaxRows + keptSelectedRows.length);
    }

    return [tableHeadRows, visibleDataRows, keptSelectedRows, tooManyClientSideRows];
  }, [as, api, style, rowStyles, maybeStyle, columnSizes, getCount, filterMaxRows]);

  // Push back to the caller a way to ask us where a row is.
  // Refs are cheap to assign to, so we don't bother doing this in a useEffect
  if (props.rowLookup) props.rowLookup.current = api.lookup;

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
  visibleDataRows: ReactElement[],
  keptSelectedRows: ReactElement[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  _virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  tableHeadRows: ReactElement[],
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
        {tableHeadRows}
      </div>

      {/* Table Body */}
      <div
        css={{
          ...(style.betweenRowsCss ? Css.addIn(`& > div > *`, style.betweenRowsCss).$ : {}),
          ...(style.firstNonHeaderRowCss ? Css.addIn(`& > div:first-of-type > *`, style.firstNonHeaderRowCss).$ : {}),
          ...(style.lastRowCss && Css.addIn("& > div:last-of-type", style.lastRowCss).$),
        }}
      >
        {keptSelectedRows}
        {/* Show an info message if it's set. */}
        {firstRowMessage && (
          <div css={{ ...style.firstRowMessageCss }} data-gridrow>
            {firstRowMessage}
          </div>
        )}
        {visibleDataRows}
      </div>
    </div>
  );
}

/** Renders as a table, primarily/solely for good print support. */
function renderTable<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumnWithId<R>[],
  visibleDataRows: ReactElement[],
  keptSelectedRows: ReactElement[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  _virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  tableHeadRows: ReactElement[],
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
      <thead css={Css.if(stickyHeader).sticky.topPx(stickyOffset).z(zIndices.stickyHeader).$}>{tableHeadRows}</thead>
      <tbody>
        {keptSelectedRows}
        {/* Show an all-column-span info message if it's set. */}
        {firstRowMessage && (
          <tr>
            <td colSpan={columns.length} css={{ ...style.firstRowMessageCss }}>
              {firstRowMessage}
            </td>
          </tr>
        )}
        {visibleDataRows}
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
  visibleDataRows: ReactElement[],
  keptSelectedRows: ReactElement[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  tableHeadRows: ReactElement[],
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
        List: VirtualRoot(listStyle, columns as any, id, xss),
        Footer: () => {
          return (
            <div css={footerStyle}>
              {infiniteScroll?.nextPageLoading && (
                <div css={Css.h5.df.aic.jcc.$}>
                  <Loader size={"xs"} />
                </div>
              )}
            </div>
          );
        },
      }}
      // Pin/sticky both the header row(s) + firstRowMessage to the top
      topItemCount={stickyHeader ? tableHeadRows.length : 0}
      itemContent={(index) => {
        // Since we have 3 arrays of rows: `tableHeadRows` and `visibleDataRows` and `keptSelectedRows` we must determine which one to render.

        if (index < tableHeadRows.length) {
          return tableHeadRows[index];
        }

        // Reset index
        index -= tableHeadRows.length;

        // Show keptSelectedRows if there are any
        if (index < keptSelectedRows.length) {
          return keptSelectedRows[index];
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
        return visibleDataRows[index];
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
            // Add a `index > 0` check b/c Virtuoso is calling this in storybook
            // with `endReached(0)` at odd times, like on page unload/story load,
            // which then causes our test data to have duplicate ids in it.
            endReached: (index) => (index > 0 ? infiniteScroll.onEndReached(index) : 0),
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
