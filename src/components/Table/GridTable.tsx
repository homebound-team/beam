import { Observer } from "mobx-react";
import React, { MutableRefObject, ReactElement, ReactNode, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { TableVirtuoso, VirtuosoHandle } from "react-virtuoso";
import { navLink } from "src/components/CssReset";
import { PresentationFieldProps, PresentationProvider } from "src/components/PresentationContext";
import { GridCollapseContext } from "src/components/Table/GridCollapseContext";
import { createRowLookup, GridRowLookup } from "src/components/Table/GridRowLookup";
import { GridSortContext, GridSortContextProps } from "src/components/Table/GridSortContext";
import {
  isChromeRow,
  isLeafRow,
  maybeAddCardPadding,
  nestedCardCellStyles,
  NestedCards,
} from "src/components/Table/nestedCards";
import { SortHeader } from "src/components/Table/SortHeader";
import { ensureClientSideSortValueIsSortable, sortRows } from "src/components/Table/sortRows";
import { defaultStyle } from "src/components/Table/styles";
import {
  GridCellAlignment,
  GridCellContent,
  GridColumn,
  GridDataRow,
  GridRowStyles,
  GridSortConfig,
  GridStyle,
  GridTableXss,
  Kinded,
  NestedCardStyle,
  RenderAs,
  RenderCellFn,
  RowTuple,
} from "src/components/Table/types";
import { SortState, useSortState } from "src/components/Table/useSortState";
import { useToggleIds } from "src/components/Table/useToggleIds";
import {
  applyRowFn,
  calcColumnSizes,
  getAlignment,
  getFirstOrLastCellCss,
  getIndentationCss,
  getJustification,
  isContentEmpty,
  isGridCellContent,
  matchesFilter,
  maybeApplyFunction,
  maybeDarken,
} from "src/components/Table/utils";
import { Css, Only } from "src/Css";

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

  const maybeSorted = useMemo(() => {
    if (sorting?.on === "client" && sortState) {
      // If using client-side sort, the sortState use S = number
      return sortRows(columns, rows, sortState as any as SortState<number>);
    }
    return rows;
  }, [columns, rows, sorting, sortState]);

  const columnSizes = useMemo(
    () => calcColumnSizes(columns, style.nestedCards?.firstLastColumnWidth),
    [columns, style.nestedCards?.firstLastColumnWidth],
  );

  // Filter + flatten + component-ize the sorted rows.
  let [headerRows, filteredRows]: [RowTuple<R>[], RowTuple<R>[]] = useMemo(() => {
    // Break up "foo bar" into `[foo, bar]` and a row must match both `foo` and `bar`
    const filters = (filter && filter.split(/ +/)) || [];

    function makeRowComponent(row: GridDataRow<R>): JSX.Element {
      // We only pass sortState to header rows, b/c non-headers rows shouldn't have to re-render on sorting
      // changes, and so by not passing the sortProps, it means the data rows' React.memo will still cache them.
      const sortProps = row.kind === "header" ? { sorting, sortState, setSortKey } : { sorting };
      const RowComponent = observeRows ? ObservedGridRow : MemoizedGridRow;

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
              openCards:
                row.kind === "header" && headerCards
                  ? headerCards.currentOpenCards()
                  : rowCards
                  ? rowCards.currentOpenCards()
                  : undefined,
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
    const rowCards = !!style.nestedCards && new NestedCards(columns, filteredRows, style.nestedCards);
    const headerCards = !!style.nestedCards && new NestedCards(columns, headerRows, style.nestedCards);

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
        rowCards && matches && rowCards.addSpacer(row);
        visitRows(row.children, isCard);
      }

      !isLeafRow(row) && isCard && rowCards && rowCards.closeCard(row);
    }

    function visitRows(rows: GridDataRow<R>[], addSpacer: boolean): void {
      const length = rows.length;
      rows.forEach((row, i) => {
        if (row.kind === "header") {
          headerCards && headerCards.maybeOpenCard(row);
          headerRows.push([row, makeRowComponent(row)]);
          headerCards && headerCards.closeCard(row);
          headerCards && headerCards.done();
          return;
        }

        visit(row);

        addSpacer && rowCards && i !== length - 1 && rowCards.addSpacer(row);
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
  return (
    <PresentationProvider fieldProps={fieldProps} wrap={style?.presentationSettings?.wrap}>
      {renders[_as](
        style,
        id,
        columns,
        headerRows,
        filteredRows,
        firstRowMessage,
        stickyHeader,
        xss,
        virtuosoRef,
        rowStyles,
        columnSizes,
      )}
    </PresentationProvider>
  );
}

// Determine which HTML element to use to build the GridTable
const renders: Record<RenderAs, typeof renderTable> = {
  table: renderTable,
  div: renderTable,
  virtual: renderVirtualTable,
};

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
  _virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  _rowStyles: GridRowStyles<R> | undefined,
  columnSizes: string[],
): ReactElement {
  const isNestedCardStyle = !!style.nestedCards;
  return (
    <table {...getTableProps(id, style, xss, columnSizes)}>
      <thead {...(stickyHeader ? { css: Css.sticky.top0.z999.$ } : {})}>
        {headerRows.map(([row, node], idx) => (isChromeRow(row) ? <tr key={`chrome_${idx}`}>{node}</tr> : node))}
      </thead>
      <tbody>
        {/* Show an all-column-span info message if it's set. Add `2` if we have nested cards to account for the left and right 'card-end' columns */}
        {firstRowMessage && (
          <tr data-gridrow={true}>
            <td colSpan={columns.length + (isNestedCardStyle ? 2 : 0)} css={{ ...style.firstRowMessageCss }}>
              {firstRowMessage}
            </td>
          </tr>
        )}
        {filteredRows.map(([row, node], idx) => (isChromeRow(row) ? <tr key={`chrome_${idx}`}>{node}</tr> : node))}
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
function renderVirtualTable<R extends Kinded>(
  style: GridStyle,
  id: string,
  columns: GridColumn<R>[],
  headerRows: RowTuple<R>[],
  filteredRows: RowTuple<R>[],
  firstRowMessage: string | undefined,
  stickyHeader: boolean,
  xss: any,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  rowStyles: GridRowStyles<R> | undefined,
  columnSizes: string[],
): ReactElement {
  const isNestedCardStyle = !!style.nestedCards;
  return (
    <TableVirtuoso
      overscan={5}
      ref={virtuosoRef}
      components={{
        Table: React.forwardRef((props, ref) => (
          <table {...getTableProps(id, style, xss, columnSizes)} {...props} ref={ref as any} />
        )),
        TableHead: React.forwardRef((props, ref) => <thead css={Css.z999.important.$} {...props} ref={ref as any} />),
        TableRow: React.forwardRef(({ children: rowTuple, ...props }, ref) => {
          const [row, rowEl] = rowTuple as RowTuple<R>;
          return (
            <tr {...props} {...(!isChromeRow(row) ? getRowProps(row, style, rowStyles) : {})} ref={ref as any}>
              {rowEl!}
            </tr>
          );
        }),
      }}
      fixedHeaderContent={() => {
        return (
          <>
            {headerRows.map(([row, el], idx) => (
              <tr {...(!isChromeRow(row) ? getRowProps(row, style, rowStyles) : {})} key={`headerRow_${idx}`}>
                {el}
              </tr>
            ))}
            {firstRowMessage && (
              <tr data-gridrow={true}>
                {/* Show an all-column-span info message if it's set. Add `2` if we have nested cards to account for the left and right 'card-end' columns */}
                <td colSpan={columns.length + (isNestedCardStyle ? 2 : 0)}>
                  <div css={{ ...style.firstRowMessageCss }}>{firstRowMessage}</div>
                </td>
              </tr>
            )}
          </>
        );
      }}
      itemContent={(index) => filteredRows[index]}
      totalCount={filteredRows.length}
    />
  );
}

function getTableProps(id: string, style: GridStyle, xss: any, columnSizes: string[]) {
  return {
    css: {
      ...Css.w100
        .add("borderCollapse", "collapse")
        .add("tableLayout", "fixed")
        .mw(`calc(${columnSizes.join(" + ")})`).$,
      ...(style.betweenRowsCss ? Css.addIn("& > tbody > tr ", style.betweenRowsCss).$ : {}),
      ...(style.afterHeaderSpacing
        ? Css.addIn("& > thead:after", Css.hPx(style.afterHeaderSpacing).contentEmpty.db.$).$
        : {}),
      // removes border between header and second row
      ...(style.firstNonHeaderRowCss ? Css.addIn("& > tbody > tr:first-of-type", style.firstNonHeaderRowCss).$ : {}),
      ...style.rootCss,
      ...xss,
    },
    "data-testid": id,
  };
}

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
  const { as, columns, row, style, rowStyles, sorting, sortState, setSortKey, openCards, columnSizes } = props;

  // We treat the "header" kind as special for "good defaults" styling
  const isHeader = row.kind === "header";
  const rowStyle = rowStyles?.[row.kind];

  const openCardStyles =
    typeof openCards === "string"
      ? openCards
          .split(":")
          .map((openCardKind) => style.nestedCards!.kinds[openCardKind])
          .filter((style) => style)
      : undefined;

  const rowCardStyles: NestedCardStyle | undefined = style.nestedCards?.kinds[row.kind];

  const rowStyleCellCss = maybeApplyFunction(row, rowStyle?.cellCss);
  let currentColspan = 1;

  let cardPaddingStyles: NestedCardStyle[] | undefined = openCardStyles;
  if (cardPaddingStyles && isLeafRow(row) && rowCardStyles) {
    cardPaddingStyles.push(rowCardStyles);
  }

  const rowContents = (
    <>
      {cardPaddingStyles && maybeAddCardPadding(cardPaddingStyles, "first", style.nestedCards!, row)}
      {columns.map((column, columnIndex) => {
        if (column.mw) {
          // Validate the column's minWidth definition if set.
          if (!column.mw.endsWith("px") && !column.mw.endsWith("%")) {
            throw new Error("Beam Table column min-width definition only supports px or percentage values");
          }
        }

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
        const alignment = getAlignment(column, maybeContent);
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
        const maybeSticky =
          (isGridCellContent(maybeContent) ? maybeContent.sticky : undefined) ?? column.sticky ?? undefined;

        const maybeStickyColumnStyles =
          maybeSticky && columnSizes
            ? {
                ...Css.sticky.z1.$,
                ...(maybeSticky === "left"
                  ? Css.left(`calc(${columnSizes.slice(0, maybeNestedCardColumnIndex).join(" + ")})`)
                      .addIn("&.stuck", Css.z2.add("transformStyle", "preserve-3d").$)
                      .addIn(
                        "&.stuck:after",
                        Css.contentEmpty
                          .wPx(1)
                          .absolute.top0.bottom0.right0.add("transform", "translateZ(-1px)")
                          .boxShadow("2px 0 5px 0 black").$,
                      ).$
                  : {}),
                ...(maybeSticky === "right"
                  ? Css.right(
                      `calc(${columnSizes.slice(maybeNestedCardColumnIndex + 1 - columnSizes.length).join(" + ")})`,
                    )
                      .addIn("&.stuck", Css.z2.add("transformStyle", "preserve-3d").$)
                      .addIn(
                        "&.stuck:after",
                        Css.contentEmpty
                          .wPx(1)
                          .absolute.top0.bottom0.left0.add("transform", "translateZ(-1px)")
                          .boxShadow("-2px 0 5px 0 black").$,
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
          // Add `vTop` to keep inline with existing table structures. Possibly can be removed later, making the default value `middle`. Maybe defined by Beam Styles, fixed: middle, flexible: top.
          // td/th seem to add a 1px of padding. Remove that.
          // Apply alignment specified by either the row or column
          ...Css.vTop.p0.add("textAlign", alignment).$,
          // Apply any static/all-cell styling
          ...style.cellCss,
          // Then override with first/last cell styling
          ...getFirstOrLastCellCss(style, columnIndex, columns),
          ...getIndentationCss(style, rowStyle, columnIndex, maybeContent),
          // Then apply any header-specific override. Remove <th>'s auto applied bold font weight
          ...(isHeader && { ...Css.fw("inherit").$, ...style.headerCellCss }),
          // The specific cell's css (if any from GridCellContent)
          ...rowStyleCellCss,
          // Get any card styles for the cells.
          ...nestedCardCellStyles(
            row,
            openCardStyles,
            style,
            isGridCellContent(maybeContent) ? maybeContent : undefined,
          ),
          // Add any cell specific style overrides
          ...(isGridCellContent(maybeContent) && maybeContent.typeScale ? Css[maybeContent.typeScale].$ : {}),
          // Define the width of the column on each cell. Supports col spans.
          // TODO: Width only needs to be applied to the first row.
          //  Colspans can't be done this way... Maybe we don't even need to do this width definition as tables will basically ignore this unless its the first row.
          ...(columnSizes && {
            width: `calc(${columnSizes
              .slice(maybeNestedCardColumnIndex, maybeNestedCardColumnIndex + currentColspan)
              .join(" + ")})`,
          }),
          ...(column.mw ? Css.mw(column.mw).$ : {}),
          // Leaf rows need to draw their top & bottom borders, however we cannot use a 'border' directly on the cell,
          // as it'll cause rendering issues on the 'padding' columns, as those do not have borders defined (and can't due to the nested of multiple cards).
          // Instead create a before pseudo element for apply the border styles to.
          ...(rowCardStyles && isLeafRow(row)
            ? {
                ...Css.pyPx(rowCardStyles.brPx).$,
                ...(rowCardStyles.bColor
                  ? Css.relative.addIn(
                      ":before",
                      Css.contentEmpty.absolute.top0.bottom0.left0.right0.bt.bb.bc(rowCardStyles.bColor).$,
                    ).$
                  : {}),
              }
            : {}),
          // frozen/sticky - apply sticky columns last in order to ensure `position: sticky` is set/overrides other potential positions
          ...maybeStickyColumnStyles,
        };

        const renderFn: RenderCellFn<any> =
          rowStyle?.renderCell || rowStyle?.rowLink
            ? rowLinkRenderFn(currentColspan)
            : isHeader
            ? headerRenderFn(columns, column, sortState, setSortKey, currentColspan)
            : rowStyle?.onClick
            ? rowClickRenderFn(currentColspan)
            : defaultRenderFn(currentColspan);

        return renderFn(columnIndex, cellCss, content, row, rowStyle);
      })}

      {cardPaddingStyles && maybeAddCardPadding(cardPaddingStyles, "final", style.nestedCards!, row)}
    </>
  );

  return as !== "virtual" || runningInJest ? (
    <tr {...getRowProps(row, style, rowStyles)}>{rowContents}</tr>
  ) : (
    rowContents
  );
}

function getRowProps<R extends Kinded>(row: GridDataRow<R>, style: GridStyle, rowStyles: GridRowStyles<R> | undefined) {
  const rowStyle = rowStyles?.[row.kind];
  const rowStyleCellCss = maybeApplyFunction(row, rowStyle?.cellCss);
  const rowCss = {
    ...((rowStyle?.rowLink || rowStyle?.onClick) &&
      style.rowHoverColor && {
        // Even though backgroundColor is set on the cellCss (due to display: content), the hover target is the row.
        "&:hover > *": Css.cursorPointer.bgColor(maybeDarken(rowStyleCellCss?.backgroundColor, style.rowHoverColor)).$,
      }),
    ...maybeApplyFunction(row, rowStyle?.rowCss),
    ...Css.hPx(1).$,
  };
  return { css: rowCss, "data-gridrow": true };
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
    return <SortHeader content={content} alignment={alignment} />;
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

function maybeAlign(content: ReactNode, alignment: GridCellAlignment) {
  const justificationCss = getJustification(alignment);
  // Then override with per-cell/per-row justification/indentation
  // return <div css={{ ...Css.df.$, ...justificationCss }}>{content}</div>;
  return content;
}

/** Renders our default cell element, i.e. if no row links and no custom renderCell are used. */
const defaultRenderFn: (colspan: number | undefined) => RenderCellFn<any> = (colspan) => (key, css, content) => {
  return (
    <td key={key} css={{ ...css }} colSpan={colspan}>
      {content}
    </td>
  );
};

/** Sets up the `GridContext` so that header cells can access the current sort settings. */
const headerRenderFn: (
  columns: GridColumn<any>[],
  column: GridColumn<any>,
  sortState: SortState<any> | undefined,
  setSortKey: Function | undefined,
  colspan: number | undefined,
) => RenderCellFn<any> = (columns, column, sortState, setSortKey, colspan) => (key, css, content) => {
  const [currentKey, direction] = sortState || [];
  // If server-side sorting, use the user's key for this column; client-side sorting, use the index.
  const ourSortKey = column.serverSideSortKey || columns.indexOf(column);
  const context: GridSortContextProps = {
    sorted: ourSortKey === currentKey ? direction : undefined,
    toggleSort: () => setSortKey!(ourSortKey),
  };
  return (
    <GridSortContext.Provider key={key} value={context}>
      <th css={{ ...css }} colSpan={colspan}>
        {content}
      </th>
    </GridSortContext.Provider>
  );
};

/** Renders a cell element when a row link is in play. */
const rowLinkRenderFn: (colspan: number | undefined) => RenderCellFn<any> =
  (colspan) => (key, css, content, row, rowStyle) => {
    const to = rowStyle!.rowLink!(row);
    return (
      <td key={key} css={{ ...css }} colSpan={colspan}>
        <Link to={to} css={Css.noUnderline.color("unset").db.$} className={navLink}>
          {content}
        </Link>
      </td>
    );
  };

/** Renders a cell that will fire the RowStyle.onClick. */
const rowClickRenderFn: (colspan: number | undefined) => RenderCellFn<any> =
  (colspan) => (key, css, content, row, rowStyle) => {
    return (
      <td {...{ key }} css={{ ...css }} onClick={() => rowStyle!.onClick!(row)} colSpan={colspan}>
        {content}
      </td>
    );
  };

let runningInJest = false;
/** Tells GridTable we're running in Jest, which forces as=virtual to be as=div, to work in jsdom. */
export function setRunningInJest() {
  runningInJest = true;
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
