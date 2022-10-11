import memoizeOne from "memoize-one";
import React, { MutableRefObject, ReactElement, useEffect, useMemo, useRef } from "react";
import { Components, Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { PresentationFieldProps, PresentationProvider } from "src/components/PresentationContext";
import { GridTableApi, GridTableApiImpl } from "src/components/Table/GridTableApi";
import { useSetupColumnSizes } from "src/components/Table/hooks/useSetupColumnSizes";
import { SortState, useSortState } from "src/components/Table/hooks/useSortState";
import { defaultStyle, GridStyle, GridStyleDef, resolveStyles, RowStyles } from "src/components/Table/TableStyles";
import {
  Direction,
  GridColumn,
  GridTableXss,
  Kinded,
  ParentChildrenTuple,
  RenderAs,
  RowTuple,
} from "src/components/Table/types";
import { createRowLookup, GridRowLookup } from "src/components/Table/utils/GridRowLookup";
import { RowStateContext } from "src/components/Table/utils/RowState";
import { sortRows } from "src/components/Table/utils/sortRows";
import { applyRowFn, matchesFilter } from "src/components/Table/utils/utils";
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
export type GridSortConfig<S> =
  | {
      on: "client";
      /** The optional initial column (index in columns) and direction to sort. */
      initial?: [S | GridColumn<any>, Direction] | undefined;
      caseSensitive?: boolean;
      /** The optional primary sort column, this will be sorted first above/below table sort  */
      primary?: [S | GridColumn<any>, Direction] | undefined;
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
  rowStyles?: RowStyles<R>;
  /** Allow looking up prev/next of a row i.e. for SuperDrawer navigation. */
  rowLookup?: MutableRefObject<GridRowLookup<R> | undefined>;
  /** Whether the header row should be sticky. */
  stickyHeader?: boolean;
  stickyOffset?: number;
  /** Configures sorting via a hash, does not need to be stable. */
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
   * Expected format is `${row.kind}_${row.id}_${column.name}`.
   */
  activeCellId?: string;
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
 */
export function GridTable<R extends Kinded, S = {}, X extends Only<GridTableXss, X> = {}>(
  props: GridTableProps<R, S, X>,
) {
  const {
    id = "gridTable",
    as = "div",
    columns,
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
  } = props;

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

  const { rowState } = api;
  rowState.setRows(rows);

  useEffect(() => {
    rowState.activeRowId = activeRowId;
  }, [rowState, activeRowId]);

  useEffect(() => {
    rowState.activeCellId = activeCellId;
  }, [rowState, activeCellId]);

  // We track render count at the table level, which seems odd (we should be able to track this
  // internally within each GridRow using a useRef), but we have suspicions that react-virtuoso
  // (or us) is resetting component state more than necessary, so we track render counts from
  // here instead.
  const { getCount } = useRenderCount();

  const columnSizes = useSetupColumnSizes(style, columns, resizeTarget ?? resizeRef);

  // Make a single copy of our current collapsed state, so we'll have a single observer.
  const collapsedIds = useComputed(() => rowState.collapsedIds, [rowState]);

  const [sortState, setSortKey, sortOn, caseSensitive] = useSortState<R, S>(columns, props.sorting);
  const maybeSorted = useMemo(() => {
    if (sortOn === "client" && sortState) {
      // If using client-side sort, the sortState use S = number
      return sortRows(columns, rows, sortState as any as SortState<number>, caseSensitive);
    }
    return rows;
  }, [columns, rows, sortOn, sortState, caseSensitive]);

  const hasTotalsRow = rows.some((row) => row.id === "totals");

  // Flatten + component-ize the sorted rows.
  let [headerRows, visibleDataRows, totalsRows, filteredRowIds]: [
    RowTuple<R>[],
    RowTuple<R>[],
    RowTuple<R>[],
    string[],
  ] = useMemo(() => {
    function makeRowComponent(row: GridDataRow<R>, level: number): JSX.Element {
      // We only pass sortState to header rows, b/c non-headers rows shouldn't have to re-render on sorting
      // changes, and so by not passing the sortProps, it means the data rows' React.memo will still cache them.
      const sortProps = row.kind === "header" ? { sortOn, sortState, setSortKey } : { sortOn };

      return (
        <Row
          key={`${row.kind}-${row.id}`}
          {...{
            as,
            columns,
            row,
            style,
            rowStyles,
            stickyHeader,
            // If we have a totals row then add the height of the totals row (52px) to the `stickyOffset` for the "header" kind
            stickyOffset: hasTotalsRow && row.kind === "header" ? 52 + stickyOffset : stickyOffset,
            columnSizes,
            level,
            getCount,
            api,
            cellHighlight: "cellHighlight" in maybeStyle && maybeStyle.cellHighlight === true,
            ...sortProps,
          }}
        />
      );
    }

    // Split out the header rows from the data rows so that we can put an `infoMessage` in between them (if needed).
    const headerRows: RowTuple<R>[] = [];
    const totalsRows: RowTuple<R>[] = [];
    const visibleDataRows: RowTuple<R>[] = [];
    const filteredRowIds: string[] = [];

    function visit([row, children]: ParentChildrenTuple<R>, level: number, visible: boolean): void {
      visible && visibleDataRows.push([row, makeRowComponent(row, level)]);
      // This row may be invisible (because it's parent is collapsed), but we still want
      // to consider it matched if it or it's parent matched a filter.
      filteredRowIds.push(row.id);

      if (children.length) {
        // Consider "isCollapsed" as true if the parent wasn't visible.
        const isCollapsed = !visible || collapsedIds.includes(row.id);
        visitRows(children, level + 1, !isCollapsed);
      }
    }

    function visitRows(rows: ParentChildrenTuple<R>[], level: number, visible: boolean): void {
      const length = rows.length;
      rows.forEach((row, i) => {
        if (row[0].kind === "header") {
          headerRows.push([row[0], makeRowComponent(row[0], level)]);
          return;
        }

        if (row[0].kind === "totals") {
          totalsRows.push([row[0], makeRowComponent(row[0], level)]);
          return;
        }

        visit(row, level, visible);
      });
    }

    // Call `visitRows` with our a pre-filtered set list
    const filteredRows = filterRows(api, columns, maybeSorted, filter);
    visitRows(filteredRows, 0, true);

    return [headerRows, visibleDataRows, totalsRows, filteredRowIds];
  }, [
    as,
    api,
    filter,
    maybeSorted,
    columns,
    style,
    rowStyles,
    sortOn,
    setSortKey,
    sortState,
    stickyHeader,
    stickyOffset,
    columnSizes,
    collapsedIds,
    getCount,
    hasTotalsRow,
  ]);

  let tooManyClientSideRows = false;
  if (filterMaxRows && visibleDataRows.length > filterMaxRows) {
    tooManyClientSideRows = true;
    visibleDataRows = visibleDataRows.slice(0, filterMaxRows);
  }

  rowState.setMatchedRows(filteredRowIds);

  // Push back to the caller a way to ask us where a row is.
  const { rowLookup } = props;
  if (rowLookup) {
    // Refs are cheap to assign to, so we don't bother doing this in a useEffect
    rowLookup.current = createRowLookup(columns, visibleDataRows, virtuosoRef);
  }

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
      hideLabel: true,
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
  const rowStateContext = useMemo(() => ({ rowState }), [rowState]);
  return (
    <RowStateContext.Provider value={rowStateContext}>
      <PresentationProvider fieldProps={fieldProps} wrap={style?.presentationSettings?.wrap}>
        {/* If virtualized take some pixels off the width to accommodate when virtuoso's scrollbar is introduced. */}
        {/* Otherwise a horizontal scrollbar will _always_ appear once the vertical scrollbar is needed */}
        <div ref={resizeRef} css={Css.w100.if(as === "virtual").w("calc(100% - 20px)").$} />
        {renders[_as](
          style,
          id,
          columns,
          headerRows,
          totalsRows,
          visibleDataRows,
          firstRowMessage,
          stickyHeader,
          xss,
          virtuosoRef,
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
  totalsRows: RowTuple<R>[],
  visibleDataRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  _stickyHeader: boolean,
  xss: any,
  _virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
): ReactElement {
  return (
    <div
      css={{
        // Use `fit-content` to ensure the width of the table takes up the full width of its content.
        // Otherwise, the table's width would be that of its container, which may not be as wide as the table itself.
        // In cases where we have sticky columns on a very wide table, then the container which the columns "stick" to (which is the table),
        // needs to be as wide as the table's content, or else we lose the "stickiness" once scrolling past width of the table's container.
        ...Css.mw("fit-content").$,
        /*
          Using (n + 3) here to target all rows that are after the first non-header row. Since n starts at 0, we can use
          the + operator as an offset.
          Inspired by: https://stackoverflow.com/a/25005740/2551333
        */
        ...(style.betweenRowsCss
          ? Css.addIn(`& > div:nth-of-type(n+${headerRows.length + totalsRows.length + 2}) > *`, style.betweenRowsCss).$
          : {}),
        ...(style.firstNonHeaderRowCss ? Css.addIn(`& > div:nth-of-type(2) > *`, style.firstNonHeaderRowCss).$ : {}),
        ...(style.lastRowCss && Css.addIn("& > div:last-of-type", style.lastRowCss).$),
        ...(style.firstRowCss && Css.addIn("& > div:first-of-type", style.firstRowCss).$),
        ...style.rootCss,
        ...(style.minWidthPx ? Css.mwPx(style.minWidthPx).$ : {}),
        ...xss,
      }}
      data-testid={id}
    >
      {totalsRows.map(([, node]) => node)}
      {headerRows.map(([, node]) => node)}
      {/* Show an info message if it's set. */}
      {firstRowMessage && (
        <div css={{ ...style.firstRowMessageCss }} data-gridrow>
          {firstRowMessage}
        </div>
      )}
      {visibleDataRows.map(([, node]) => node)}
    </div>
  );
}

/** Renders as a table, primarily/solely for good print support. */
function renderTable<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumn<R>[],
  headerRows: RowTuple<R>[],
  totalsRows: RowTuple<R>[],
  visibleDataRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  _stickyHeader: boolean,
  xss: any,
  _virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
): ReactElement {
  return (
    <table
      css={{
        ...Css.w100.add("borderCollapse", "separate").add("borderSpacing", "0").$,
        ...Css.addIn("& > tbody > tr > * ", style.betweenRowsCss || {})
          // removes border between header and second row
          .addIn("& > tbody > tr:first-of-type > *", style.firstNonHeaderRowCss || {}).$,
        ...Css.addIn("& > tbody > tr:last-of-type", style.lastRowCss).$,
        ...Css.addIn("& > tbody > tr:first-of-type", style.firstRowCss).$,
        ...style.rootCss,
        ...(style.minWidthPx ? Css.mwPx(style.minWidthPx).$ : {}),
        ...xss,
      }}
      data-testid={id}
    >
      <thead>{[...totalsRows, ...headerRows].map(([, node]) => node)}</thead>
      <tbody>
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
  columns: GridColumn<R>[],
  headerRows: RowTuple<R>[],
  totalsRows: RowTuple<R>[],
  visibleDataRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
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
        // Applying a zIndex: 2 to ensure it stays on top of sticky columns
        TopItemList: React.forwardRef((props, ref) => (
          <div {...props} ref={ref as MutableRefObject<HTMLDivElement>} style={{ ...props.style, ...{ zIndex: 2 } }} />
        )),
        List: VirtualRoot(listStyle, columns, id, xss),
        Footer: () => <div css={footerStyle} />,
      }}
      // Pin/sticky both the header row(s) + firstRowMessage to the top
      topItemCount={(stickyHeader ? headerRows.length + totalsRows.length : 0) + (firstRowMessage ? 1 : 0)}
      itemContent={(index) => {
        // Since we have three arrays of rows: `headerRows`, `totalsRows`, and `filteredRow` we
        // must determine which one to render.

        // Determine if we need to render a totals row
        if (index < totalsRows.length) {
          return totalsRows[index][1];
        }

        // Reset index
        index -= totalsRows.length;

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
        return visibleDataRows[index][1];
      }}
      totalCount={
        (headerRows.length || 0) + (totalsRows.length || 0) + (firstRowMessage ? 1 : 0) + (visibleDataRows.length || 0)
      }
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
  columns: GridColumn<R>[],
  rows: GridDataRow<R>[],
  filter: string | undefined,
): ParentChildrenTuple<R>[] {
  // Make a functions to do recursion
  function acceptAll(acc: ParentChildrenTuple<R>[], row: GridDataRow<R>): ParentChildrenTuple<R>[] {
    return acc.concat([[row, row.children?.reduce(acceptAll, []) ?? []]]);
  }

  function filterFn(acc: ParentChildrenTuple<R>[], row: GridDataRow<R>): ParentChildrenTuple<R>[] {
    // Break up "foo bar" into `[foo, bar]` and a row must match both `foo` and `bar`
    const filters = (filter && filter.split(/ +/)) || [];
    const matches =
      row.kind === "header" ||
      row.kind === "totals" ||
      filters.length === 0 ||
      filters.every((f) =>
        columns.map((c) => applyRowFn(c, row, api, 0)).some((maybeContent) => matchesFilter(maybeContent, f)),
      );
    if (matches) {
      return acc.concat([[row, row.children?.reduce(acceptAll, []) ?? []]]);
    } else {
      const matchedChildren = row.children?.reduce(filterFn, []) ?? [];
      if (
        matchedChildren.length > 0 ||
        typeof row.pin === "string" ||
        (row.pin !== undefined && row.pin.filter !== true)
      ) {
        return acc.concat([[row, matchedChildren]]);
      } else {
        return acc;
      }
    }
  }
  return rows.reduce(filterFn, []);
}
