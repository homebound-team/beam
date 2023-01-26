import { ReactNode } from "react";
import { GridCellContent } from "src/components/Table/components/cell";
import { ExpandableHeader } from "src/components/Table/components/ExpandableHeader";
import { GridDataRow } from "src/components/Table/components/Row";
import { SortHeader } from "src/components/Table/components/SortHeader";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { GridStyle, RowStyle } from "src/components/Table/TableStyles";
import { GridCellAlignment, GridColumnWithId, Kinded, RenderAs } from "src/components/Table/types";
import { Css, Properties } from "src/Css";
import { getButtonOrLink } from "src/utils/getInteractiveElement";

/** If a column def return just string text for a given row, apply some default styling. */
export function toContent(
  maybeContent: ReactNode | GridCellContent,
  isHeader: boolean,
  canSortColumn: boolean,
  isClientSideSorting: boolean,
  style: GridStyle,
  as: RenderAs,
  alignment: GridCellAlignment,
  column: GridColumnWithId<any>,
  columns: GridColumnWithId<any>[],
  isExpandableHeader: boolean,
  isExpandable: boolean,
  minStickyLeftOffset: number,
): ReactNode {
  let content = isGridCellContent(maybeContent) ? maybeContent.content : maybeContent;
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

  content =
    isGridCellContent(maybeContent) && !!maybeContent.onClick
      ? getButtonOrLink(content, maybeContent.onClick, {
          css: Css.maxw100.lightBlue700.ta("inherit").if(style?.presentationSettings?.wrap === false).truncate.$,
        })
      : content;

  if (content && typeof content === "string" && isHeader && canSortColumn) {
    return (
      <SortHeader
        content={content}
        iconOnLeft={alignment === "right"}
        sortKey={column.serverSideSortKey ?? column.id}
      />
    );
  } else if (content && typeof content === "string" && isExpandableHeader && isExpandable) {
    return (
      <ExpandableHeader
        title={content}
        column={column}
        minStickyLeftOffset={minStickyLeftOffset}
        as={as}
        columns={columns}
      />
    );
  } else if (content && typeof content === "string" && isExpandableHeader) {
    return <span css={Css.lineClamp2.$}>{content}</span>;
  } else if (!isContentEmpty(content) && isHeader && typeof content === "string") {
    return (
      <span css={Css.lineClamp2.$} title={content}>
        {content}
      </span>
    );
  } else if (!isHeader && content && style?.presentationSettings?.wrap === false && typeof content === "string") {
    // In order to truncate the text properly, then we need to wrap it in another element
    // as our cell element is a flex container, which don't allow for applying truncation styles directly on it.
    return (
      <span css={Css.truncate.mw0.$} title={content}>
        {content}
      </span>
    );
  } else if (style.emptyCell && isContentEmpty(content)) {
    // If the content is empty and the user specified an `emptyCell` node, return that.
    return style.emptyCell;
  }
  return content;
}

export function isGridCellContent(content: ReactNode | GridCellContent): content is GridCellContent {
  return typeof content === "object" && !!content && "content" in content;
}

const emptyValues = ["", null, undefined] as any[];

function isContentEmpty(content: ReactNode): boolean {
  return emptyValues.includes(content);
}

/** Return the content for a given column def applied to a given row. */
export function applyRowFn<R extends Kinded>(
  column: GridColumnWithId<R>,
  row: GridDataRow<R>,
  api: GridTableApi<R>,
  level: number,
  expanded: boolean,
): ReactNode | GridCellContent {
  // Usually this is a function to apply against the row, but sometimes it's a hard-coded value, i.e. for headers
  const maybeContent = column[row.kind];
  if (typeof maybeContent === "function") {
    // Auto-destructure data
    return (maybeContent as Function)((row as any)["data"], { row: row as any, api, level, expanded });
  } else {
    return maybeContent;
  }
}

export const ASC = "ASC" as const;
export const DESC = "DESC" as const;
export const emptyCell: GridCellContent = { content: () => <></>, value: "" };

export function getIndentationCss<R extends Kinded>(
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

export function getFirstOrLastCellCss<R extends Kinded>(
  style: GridStyle,
  columnIndex: number,
  columns: GridColumnWithId<R>[],
): Properties {
  return {
    ...(columnIndex === 0 ? style.firstCellCss : {}),
    ...(columnIndex === columns.length - 1 ? style.lastCellCss : {}),
  };
}

/** A heuristic to detect the result of `React.createElement` / i.e. JSX. */
function isJSX(content: any): boolean {
  return typeof content === "object" && content && "type" in content && "props" in content;
}

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

export function getAlignment(
  column: GridColumnWithId<any>,
  maybeContent: ReactNode | GridCellContent,
): GridCellAlignment {
  return (isGridCellContent(maybeContent) && maybeContent.alignment) || column.align || "left";
}

// For alignment, use: 1) cell def, else 2) column def, else 3) left.
export function getJustification(
  column: GridColumnWithId<any>,
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

export function maybeApplyFunction<T>(
  row: T,
  maybeFn: Properties | ((row: T) => Properties) | undefined,
): Properties | undefined {
  return typeof maybeFn === "function" ? maybeFn(row) : maybeFn;
}

export function matchesFilter(maybeContent: ReactNode | GridCellContent, filter: string): boolean {
  const value = filterValue(maybeContent);
  if (typeof value === "string") {
    return value.toLowerCase().includes(filter.toLowerCase());
  } else if (typeof value === "number") {
    return Number(filter) === value;
  }
  return false;
}

export const HEADER = "header";
export const TOTALS = "totals";
export const EXPANDABLE_HEADER = "expandableHeader";
export const reservedRowKinds = [HEADER, TOTALS, EXPANDABLE_HEADER];

export const zIndices = {
  stickyHeader: 4,
  stickyColumns: 3,
  expandableHeaderTitle: 2,
  expandableHeaderIcon: 1,
};
