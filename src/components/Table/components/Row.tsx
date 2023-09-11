import { observer } from "mobx-react";
import { ReactElement, useContext } from "react";
import {
  defaultRenderFn,
  headerRenderFn,
  RenderCellFn,
  rowClickRenderFn,
  rowLinkRenderFn,
} from "src/components/Table/components/cell";
import { KeptGroupRow } from "src/components/Table/components/KeptGroupRow";
import { GridStyle, RowStyles } from "src/components/Table/TableStyles";
import { DiscriminateUnion, IfAny, Kinded, Pin, RenderAs } from "src/components/Table/types";
import { RowState } from "src/components/Table/utils/RowState";
import { ensureClientSideSortValueIsSortable } from "src/components/Table/utils/sortRows";
import { TableStateContext } from "src/components/Table/utils/TableState";
import {
  applyRowFn,
  EXPANDABLE_HEADER,
  getAlignment,
  getFirstOrLastCellCss,
  getJustification,
  HEADER,
  isGridCellContent,
  KEPT_GROUP,
  maybeApplyFunction,
  reservedRowKinds,
  toContent,
  TOTALS,
  zIndices,
} from "src/components/Table/utils/utils";
import { Css, Palette } from "src/Css";
import { AnyObject } from "src/types";
import { isFunction } from "src/utils";

interface RowProps<R extends Kinded> {
  as: RenderAs;
  rs: RowState<R>;
  style: GridStyle;
  rowStyles: RowStyles<R> | undefined;
  columnSizes: string[];
  getCount: (id: string) => object;
  cellHighlight: boolean;
  omitRowHover: boolean;
  hasExpandableHeader: boolean;
}

// We extract Row to its own mini-component primarily so we can React.memo'ize it.
function RowImpl<R extends Kinded, S>(props: RowProps<R>): ReactElement {
  const {
    as,
    rs,
    style,
    rowStyles,
    columnSizes,
    getCount,
    cellHighlight,
    omitRowHover,
    hasExpandableHeader,
    ...others
  } = props;

  const { tableState } = useContext(TableStateContext);
  // We're wrapped in observer, so can access these without useComputeds
  const { api, visibleColumns: columns } = tableState;
  const { row, api: rowApi, isActive, isKept: isKeptRow, isLastKeptRow, level } = rs;

  // We treat the "header" and "totals" kind as special for "good defaults" styling
  const isHeader = row.kind === HEADER;
  const isTotals = row.kind === TOTALS;
  const isExpandableHeader = row.kind === EXPANDABLE_HEADER;
  const isKeptGroupRow = row.kind === KEPT_GROUP;
  const rowStyle = rowStyles?.[row.kind as R["kind"]];
  const RowTag = as === "table" ? "tr" : "div";
  const sortOn = tableState.sortConfig?.on;

  const revealOnRowHoverClass = "revealOnRowHover";

  const showRowHoverColor = !reservedRowKinds.includes(row.kind) && !omitRowHover;

  const rowStyleCellCss = maybeApplyFunction(row as any, rowStyle?.cellCss);
  const rowCss = {
    // Optionally include the row hover styles, by default they should be turned on.
    ...(showRowHoverColor && {
      // Even though backgroundColor is set on the cellCss, the hover target is the row.
      "&:hover > *": Css.bgColor(style.rowHoverColor ?? Palette.Blue100).$,
    }),
    // For virtual tables use `display: flex` to keep all cells on the same row. For each cell in the row use `flexNone` to ensure they stay their defined widths
    ...(as === "table" ? {} : Css.relative.df.fg1.fs1.addIn("&>*", Css.flexNone.$).$),
    // Apply `cursorPointer` to the row if it has a link or `onClick` value.
    ...((rowStyle?.rowLink || rowStyle?.onClick) && { "&:hover": Css.cursorPointer.$ }),
    ...maybeApplyFunction(row as any, rowStyle?.rowCss),
    ...{
      [` > .${revealOnRowHoverClass} > *`]: Css.invisible.$,
      [`:hover > .${revealOnRowHoverClass} > *`]: Css.visible.$,
    },
    ...(isLastKeptRow && Css.addIn("&>*", style.keptLastRowCss).$),
  };

  let currentColspan = 1;
  // Keep a running count of how many expanded columns are being shown.
  let currentExpandedColumnCount: number = 0;
  let foundFirstContentColumn = false;
  let minStickyLeftOffset = 0;
  let expandColumnHidden = false;

  return (
    <RowTag css={rowCss} {...others} data-gridrow {...getCount(row.id)}>
      {isKeptGroupRow ? (
        <KeptGroupRow as={as} style={style} columnSizes={columnSizes} row={row} colSpan={columns.length} />
      ) : (
        columns.map((column, columnIndex) => {
          // If the expandable column was hidden, then we need to look at the previous column to format the `expandHeader` and 'header' kinds correctly.
          const maybeExpandedColumn = expandColumnHidden ? columns[columnIndex - 1] : column;

          // Figure out if this column should be considered 'expanded' or not. If the column is hidden on expand, then we need to look at the previous column to see if it's expanded.
          const isExpanded = tableState.isExpandedColumn(maybeExpandedColumn.id);
          // If the column is hidden on expand, we don't want to render it. We'll flag that it was hidden, so on the next column we can render this column's "expandHeader" property.
          if (column.hideOnExpand && isExpanded) {
            expandColumnHidden = true;
            return <></>;
          }

          // Need to keep track of the expanded columns so we can add borders as expected for the header rows
          const numExpandedColumns = isExpanded
            ? tableState.numberOfExpandedChildren(maybeExpandedColumn.id)
              ? // Subtract 1 if the column is hidden on expand, since we're not rendering it.
                tableState.numberOfExpandedChildren(maybeExpandedColumn.id) - (maybeExpandedColumn.hideOnExpand ? 1 : 0)
              : 0
            : 0;

          // If we're rendering the Expandable Header row, then we might need to render the previous column's `expandHeader` property in the case where the column is hidden on expand.
          column = isExpandableHeader ? maybeExpandedColumn : column;

          const { wrapAction = true, isAction = false } = column;

          const isFirstContentColumn = !isAction && !foundFirstContentColumn;
          const applyFirstContentColumnStyles = !isHeader && isFirstContentColumn;
          foundFirstContentColumn ||= applyFirstContentColumnStyles;

          if (column.mw) {
            // Validate the column's minWidth definition if set.
            if (!column.mw.endsWith("px") && !column.mw.endsWith("%")) {
              throw new Error("Beam Table column min-width definition only supports px or percentage values");
            }
          }

          // When using the variation of the table with an EXPANDABLE_HEADER, then our HEADER and TOTAL rows have special border styling
          // Keep track of the when we get to the last expanded column so we can apply this styling properly.
          if (hasExpandableHeader && (isHeader || isTotals)) {
            // When the value of `currentExpandedColumnCount` is 0, then we have started over.
            // If the current column `isExpanded`, then store the number of expandable columns.
            if (currentExpandedColumnCount === 0 && isExpanded) {
              currentExpandedColumnCount = numExpandedColumns;
            } else if (currentExpandedColumnCount > 0) {
              // If value is great than 0, then decrement. Once the value equals 0, then the special styling will be applied below.
              currentExpandedColumnCount -= 1;
            }
          }

          // Reset the expandColumnHidden flag once done with logic based upon it.
          expandColumnHidden = false;

          // Decrement colspan count and skip if greater than 1.
          if (currentColspan > 1) {
            currentColspan -= 1;
            return null;
          }
          const maybeContent = applyRowFn(column, row, rowApi, level, isExpanded);

          // Only use the `numExpandedColumns` as the `colspan` when rendering the "Expandable Header"
          currentColspan =
            isGridCellContent(maybeContent) && typeof maybeContent.colspan === "number"
              ? maybeContent.colspan
              : isExpandableHeader
              ? numExpandedColumns + 1
              : 1;
          const revealOnRowHover = isGridCellContent(maybeContent) ? maybeContent.revealOnRowHover : false;

          const canSortColumn =
            (sortOn === "client" && column.clientSideSort !== false) ||
            (sortOn === "server" && !!column.serverSideSortKey);
          const alignment = getAlignment(column, maybeContent);
          const justificationCss = getJustification(column, maybeContent, as, alignment);
          const isExpandable =
            isFunction(column.expandColumns) ||
            (column.expandColumns && column.expandColumns.length > 0) ||
            column.expandedWidth !== undefined;

          const content = toContent(
            maybeContent,
            isHeader,
            canSortColumn,
            sortOn === "client",
            style,
            as,
            alignment,
            column,
            isExpandableHeader,
            isExpandable,
            minStickyLeftOffset,
            isKeptRow,
          );

          ensureClientSideSortValueIsSortable(
            sortOn,
            isHeader || isTotals || isExpandableHeader,
            column,
            columnIndex,
            maybeContent,
          );

          const maybeSticky = ((isGridCellContent(maybeContent) && maybeContent.sticky) || column.sticky) ?? undefined;
          const maybeStickyColumnStyles =
            maybeSticky && columnSizes
              ? {
                  ...Css.sticky.z(zIndices.stickyColumns).bgWhite.$,
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

          // This relies on our column sizes being defined in pixel values, which is currently true as we calculate to pixel values in the `useSetupColumnSizes` hook
          minStickyLeftOffset += maybeSticky === "left" ? parseInt(columnSizes[columnIndex].replace("px", ""), 10) : 0;

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
            // Adding `display: flex` so we can align content within the cells, unless it is displayed as a `table`, then use `table-cell`.
            ...Css.df.if(as === "table").dtc.$,
            // Apply sticky column/cell styles
            ...maybeStickyColumnStyles,
            // Apply any static/all-cell styling
            ...style.cellCss,
            // Then override with first/last cell styling
            ...getFirstOrLastCellCss(style, columnIndex, columns),
            // Then override with per-cell/per-row justification
            ...justificationCss,
            // Then apply any header-specific override
            ...(isHeader && style.headerCellCss),
            // Then apply any totals-specific override
            ...(isTotals && style.totalsCellCss),
            ...(isTotals && hasExpandableHeader && Css.boxShadow(`inset 0 -1px 0 ${Palette.Gray200}`).$),
            // Then apply any expandable header specific override
            ...(isExpandableHeader && style.expandableHeaderCss),
            // Conditionally apply the right border styling for the header or totals row when using expandable tables
            // Only apply if not the last column in the table AND when this column is the last column in the group of expandable column or not expanded AND
            ...(hasExpandableHeader &&
              columns.length - 1 !== columnIndex &&
              (isHeader || isTotals) &&
              currentExpandedColumnCount === 0 &&
              Css.boxShadow(`inset -1px -1px 0 ${Palette.Gray200}`).$),
            // Or level-specific styling
            ...(!isHeader && !isTotals && !isExpandableHeader && !!style.levels && style.levels[level]?.cellCss),
            // Level specific styling for the first content column
            ...(applyFirstContentColumnStyles && !!style.levels && style.levels[level]?.firstContentColumn),
            // The specific cell's css (if any from GridCellContent)
            ...rowStyleCellCss,
            // Apply active row styling for non-nested card styles.
            ...(isActive ? Css.bgColor(style.activeBgColor ?? Palette.Blue50).$ : {}),
            // Add any cell specific style overrides
            ...(isGridCellContent(maybeContent) && maybeContent.typeScale ? Css[maybeContent.typeScale].$ : {}),
            // And any cell specific css
            ...(isGridCellContent(maybeContent) && maybeContent.css ? maybeContent.css : {}),
            // Apply cell highlight styles to active cell and hover
            ...Css.if(applyCellHighlight && isCellActive).br4.boxShadow(`inset 0 0 0 1px ${Palette.Blue700}`).$,
            // Define the width of the column on each cell. Supports col spans.
            width: `calc(${columnSizes.slice(columnIndex, columnIndex + currentColspan).join(" + ")})`,
            ...(typeof column.mw === "string" ? Css.mw(column.mw).$ : {}),
          };

          const cellClassNames = revealOnRowHover ? revealOnRowHoverClass : undefined;

          const cellOnClick = applyCellHighlight ? () => api.setActiveCellId(cellId) : undefined;
          const tooltip = isGridCellContent(maybeContent) ? maybeContent.tooltip : undefined;

          const renderFn: RenderCellFn<any> =
            (rowStyle?.renderCell || rowStyle?.rowLink) && wrapAction
              ? rowLinkRenderFn(as, currentColspan)
              : isHeader || isTotals || isExpandableHeader
              ? headerRenderFn(column, as, currentColspan)
              : rowStyle?.onClick && wrapAction
              ? rowClickRenderFn(as, api, currentColspan)
              : defaultRenderFn(as, currentColspan);

          return renderFn(columnIndex, cellCss, content, row, rowStyle, cellClassNames, cellOnClick, tooltip);
        })
      )}
    </RowTag>
  );
}

/**
 * Memoizes rows so that re-rendering the table doesn't re-render every single row.
 *
 * We used to have a custom `propsAreEqual` method that would only compare `props.rows`
 * on the `data` attribute, b/c our `createRows` methods do not create stable row identities;
 * i.e. if one row changes, they all change.
 *
 * However, now RowState.row synthesizes a `row` that only reactively changes when
 * that row's `data` explicitly changes, so we no longer need a custom `propsAreEqual` here.
 */
// Declared as a const + `as typeof RowImpl` to work with generics, see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-656596623
export const Row = observer(RowImpl) as typeof RowImpl;

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
  /**
   * Whether to pin this sort to the first/last of its parent's children.
   *
   * By default, pinned rows are always shown/not filtered out, however providing
   * the pin `filter: true` property will allow pinned rows to be hidden
   * while filtering.
   */
  pin?: "first" | "last" | Pin;
  data: unknown;
  /** Whether to have the row collapsed (children not visible) on initial load. This will be ignore in subsequent re-renders of the table */
  initCollapsed?: boolean;
  /** Whether to have the row selected on initial load. This will be ignore in subsequent re-renders of the table */
  initSelected?: boolean;
  /** Whether row can be selected */
  selectable?: false;
  /** Whether this row should infer its selected state based on its children's selected state */
  inferSelectedState?: false;
} & IfAny<R, AnyObject, DiscriminateUnion<R, "kind", R["kind"]>>;
