import { observer } from "mobx-react";
import React, { ReactElement, useContext } from "react";
import {
  defaultRenderFn,
  headerRenderFn,
  RenderCellFn,
  rowClickRenderFn,
  rowLinkRenderFn,
} from "src/components/Table/components/cell";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { GridStyle, RowStyles } from "src/components/Table/TableStyles";
import { DiscriminateUnion, GridColumnWithId, IfAny, Kinded, Pin, RenderAs } from "src/components/Table/types";
import { ensureClientSideSortValueIsSortable } from "src/components/Table/utils/sortRows";
import { RowStateContext, SortOn, SortState } from "src/components/Table/utils/TableState";
import {
  applyRowFn,
  getAlignment,
  getFirstOrLastCellCss,
  getIndentationCss,
  getJustification,
  isGridCellContent,
  maybeApplyFunction,
  toContent,
} from "src/components/Table/utils/utils";
import { Css, Palette } from "src/Css";
import { useComputed } from "src/hooks";
import { shallowEqual } from "src/utils/shallowEqual";

interface RowProps<R extends Kinded> {
  as: RenderAs;
  columns: GridColumnWithId<R>[];
  row: GridDataRow<R>;
  style: GridStyle;
  rowStyles: RowStyles<R> | undefined;
  stickyHeader: boolean;
  stickyOffset: number;
  sortOn: SortOn;
  sortState?: SortState;
  setSortKey?: (value: string) => void;
  columnSizes: string[];
  level: number;
  getCount: (id: string) => object;
  api: GridTableApi<R>;
  cellHighlight: boolean;
  omitRowHover: boolean;
}

// We extract Row to its own mini-component primarily so we can React.memo'ize it.
function RowImpl<R extends Kinded, S>(props: RowProps<R>): ReactElement {
  const {
    as,
    columns,
    row,
    style,
    rowStyles,
    stickyHeader,
    stickyOffset,
    sortOn,
    sortState,
    setSortKey,
    columnSizes,
    level,
    getCount,
    api,
    cellHighlight,
    omitRowHover,
    ...others
  } = props;

  const { tableState } = useContext(RowStateContext);
  const rowId = `${row.kind}_${row.id}`;
  const isActive = useComputed(() => tableState.activeRowId === rowId, [rowId, tableState]);

  // We treat the "header" and "totals" kind as special for "good defaults" styling
  const isHeader = row.kind === "header";
  const isTotals = row.kind === "totals";
  const rowStyle = rowStyles?.[row.kind];
  const RowTag = as === "table" ? "tr" : "div";

  const revealOnRowHoverClass = "revealOnRowHover";

  const rowStyleCellCss = maybeApplyFunction(row as any, rowStyle?.cellCss);
  const rowCss = {
    // Optionally include the row hover styles, by default they should be turned on.
    ...(!omitRowHover && {
      // Even though backgroundColor is set on the cellCss, the hover target is the row.
      "&:hover > *": Css.bgColor(style.rowHoverColor ?? Palette.LightBlue100).$,
    }),
    // For virtual tables use `display: flex` to keep all cells on the same row. For each cell in the row use `flexNone` to ensure they stay their defined widths
    ...(as === "table" ? {} : Css.relative.df.fg1.fs1.addIn("&>*", Css.flexNone.$).$),
    // Apply `cursorPointer` to the row if it has a link or `onClick` value.
    ...((rowStyle?.rowLink || rowStyle?.onClick) && { "&:hover": Css.cursorPointer.$ }),
    ...maybeApplyFunction(row as any, rowStyle?.rowCss),
    // Maybe add the sticky header styles
    ...((isHeader || isTotals) && stickyHeader ? Css.sticky.topPx(stickyOffset).z2.$ : undefined),
    ...{
      [` > .${revealOnRowHoverClass} > *`]: Css.invisible.$,
      [`:hover > .${revealOnRowHoverClass} > *`]: Css.visible.$,
    },
  };

  let currentColspan = 1;

  let firstContentColumnStylesApplied = false;

  return (
    <RowTag css={rowCss} {...others} data-gridrow {...getCount(row.id)}>
      {columns.map((column, columnIndex) => {
        const { wrapAction = true, isAction = false } = column;

        const applyFirstContentColumnStyles = !isHeader && !isAction && !firstContentColumnStylesApplied;
        firstContentColumnStylesApplied ||= applyFirstContentColumnStyles;

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
        const maybeContent = applyRowFn(column, row, api, level);
        currentColspan = isGridCellContent(maybeContent) ? maybeContent.colspan ?? 1 : 1;
        const revealOnRowHover = isGridCellContent(maybeContent) ? maybeContent.revealOnRowHover : false;

        const canSortColumn =
          (sortOn === "client" && column.clientSideSort !== false) ||
          (sortOn === "server" && !!column.serverSideSortKey);
        const alignment = getAlignment(column, maybeContent);
        const justificationCss = getJustification(column, maybeContent, as, alignment);
        const content = toContent(maybeContent, isHeader, canSortColumn, sortOn === "client", style, as, alignment);

        ensureClientSideSortValueIsSortable(sortOn, isHeader, column, columnIndex, maybeContent);

        const maybeSticky = ((isGridCellContent(maybeContent) && maybeContent.sticky) || column.sticky) ?? undefined;
        const maybeStickyColumnStyles =
          maybeSticky && columnSizes
            ? {
                ...Css.sticky.z1.bgWhite.$,
                ...(maybeSticky === "left"
                  ? Css.left(columnIndex === 0 ? 0 : `calc(${columnSizes.slice(0, columnIndex).join(" + ")})`).$
                  : {}),
                ...(maybeSticky === "right"
                  ? Css.right(
                      columnIndex + 1 === columnSizes.length
                        ? 0
                        : `calc(${columnSizes.slice(columnIndex + 1 - columnSizes.length).join(" + ")})`,
                    ).$
                  : {}),
              }
            : {};

        const cellId = `${row.kind}_${row.id}_${column.id}`;
        const applyCellHighlight = cellHighlight && !!column.id && !isHeader && !isTotals;
        const isCellActive = tableState.activeCellId === cellId;

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
          // Then apply any totals-specific override
          ...(isTotals && style.totalsCellCss),
          // Or level-specific styling
          ...(!isHeader && !isTotals && !!style.levels && style.levels[level]?.cellCss),
          // Level specific styling for the first content column
          ...(applyFirstContentColumnStyles && !!style.levels && style.levels[level]?.firstContentColumn),
          // The specific cell's css (if any from GridCellContent)
          ...rowStyleCellCss,
          // Apply active row styling for non-nested card styles.
          ...(isActive ? Css.bgColor(style.activeBgColor ?? Palette.LightBlue50).$ : {}),
          // Add any cell specific style overrides
          ...(isGridCellContent(maybeContent) && maybeContent.typeScale ? Css[maybeContent.typeScale].$ : {}),
          // And any cell specific css
          ...(isGridCellContent(maybeContent) && maybeContent.css ? maybeContent.css : {}),
          // Apply cell highlight styles to active cell and hover
          ...Css.if(applyCellHighlight && isCellActive).br4.boxShadow(`inset 0 0 0 1px ${Palette.LightBlue700}`).$,
          // Define the width of the column on each cell. Supports col spans.
          width: `calc(${columnSizes.slice(columnIndex, columnIndex + currentColspan).join(" + ")})`,
          ...(column.mw ? Css.mw(column.mw).$ : {}),
        };

        const cellClassNames = revealOnRowHover ? revealOnRowHoverClass : undefined;

        const cellOnClick = applyCellHighlight ? () => api.setActiveCellId(cellId) : undefined;

        const renderFn: RenderCellFn<any> =
          (rowStyle?.renderCell || rowStyle?.rowLink) && wrapAction
            ? rowLinkRenderFn(as)
            : isHeader
            ? headerRenderFn(columns, column, sortState, setSortKey, as)
            : rowStyle?.onClick && wrapAction
            ? rowClickRenderFn(as, api)
            : defaultRenderFn(as);

        return renderFn(columnIndex, cellCss, content, row, rowStyle, cellClassNames, cellOnClick);
      })}
    </RowTag>
  );
}

/**
 * Memoizes Rows so that re-rendering the table doesn't re-render every single row.
 *
 * We use a custom `propsAreEqual` for the `RowProps.row` property, which we memoize
 * based on the `GridDataRow.data` prop, such that if a table re-renders (i.e. for a cache
 * updated) and technically creates new row instances, but a row's `row.data` points to the
 * same/unchanged Apollo cache fragment, then we won't re-render that row.
 *
 * Note that if you're using virtualization, it can be surprising how unnoticeable broken row
 * memoization is.
 */
// Declared as a const + `as typeof RowImpl` to work with generics, see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-656596623
export const Row = React.memo(observer(RowImpl), (one, two) => {
  const { row: row1, ...others1 } = one;
  const { row: row2, ...others2 } = two;
  return shallowEqual(row1, row2) && shallowEqual(others1, others2);
}) as typeof RowImpl;

/** A specific kind of row, including the GridDataRow props. */
export type GridRowKind<R extends Kinded, P extends R["kind"]> = DiscriminateUnion<R, "kind", P> & {
  id: string;
  children: GridDataRow<R>[];
  selectable?: false;
};

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
  /** * Whether to pin this sort to the first/last of its parent's children.
   *
   * By default, pinned rows are always shown/not filtered out, however providing
   * the pin `filter: true` property will allow pinned rows to be hidden
   * while filtering.*/
  pin?: "first" | "last" | Pin;
  data: unknown;
  /** Whether to have the row collapsed (children not visible) on initial load. This will be ignore in subsequent re-renders of the table */
  initCollapsed?: boolean;
  /** Whether to have the row selected on initial load. This will be ignore in subsequent re-renders of the table */
  initSelected?: boolean;
  /** Whether row can be selected */
  selectable?: false;
} & IfAny<R, {}, DiscriminateUnion<R, "kind", R["kind"]>>;
