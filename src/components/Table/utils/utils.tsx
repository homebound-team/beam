import { ReactNode } from "react";
import { Icon } from "src/components/Icon";
import { GridCellContent } from "src/components/Table/components/cell";
import { ExpandableHeader } from "src/components/Table/components/ExpandableHeader";
import { GridDataRow } from "src/components/Table/components/Row";
import { SortHeader } from "src/components/Table/components/SortHeader";
import { GridRowApi } from "src/components/Table/GridTableApi";
import { GridStyle } from "src/components/Table/TableStyles";
import { GridCellAlignment, GridColumnWithId, Kinded, RenderAs } from "src/components/Table/types";
import { Css, Palette, Properties } from "src/Css";
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
  isExpandableHeader: boolean,
  isExpandable: boolean,
  minStickyLeftOffset: number,
  isKeptSelectedRow: boolean,
): ReactNode {
  // Rows within the kept selection group cannot be collapsed
  if (isKeptSelectedRow && column.id === "beamCollapseColumn") {
    return <></>;
  }

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
  const tooltip = isGridCellContent(maybeContent) ? maybeContent.tooltip : undefined;
  const tooltipEl = tooltip ? (
    <span css={Css.fs0.mlPx(4).$}>
      <Icon icon="infoCircle" tooltip={tooltip} inc={2} color={Palette.Gray600} />
    </span>
  ) : null;

  content =
    isGridCellContent(maybeContent) && !!maybeContent.onClick
      ? getButtonOrLink(content, maybeContent.onClick, {
          css: Css.maxw100.blue700.ta("inherit").if(style?.presentationSettings?.wrap === false).truncate.$,
        })
      : content;

  if (content && typeof content === "string" && isHeader && canSortColumn) {
    return (
      <SortHeader
        content={content}
        iconOnLeft={alignment === "right"}
        sortKey={column.serverSideSortKey ?? column.id}
        tooltipEl={tooltipEl}
      />
    );
  } else if (content && typeof content === "string" && isExpandableHeader && isExpandable) {
    return (
      <ExpandableHeader
        title={content}
        column={column}
        minStickyLeftOffset={minStickyLeftOffset}
        as={as}
        tooltipEl={tooltipEl}
      />
    );
  } else if (content && typeof content === "string" && isExpandableHeader) {
    return (
      <>
        <span css={Css.lineClamp2.$}>{content}</span>
        {tooltipEl}
      </>
    );
  } else if (!isContentEmpty(content) && isHeader && typeof content === "string") {
    return (
      <>
        <span css={Css.lineClamp2.$} title={content}>
          {content}
        </span>
        {tooltipEl}
      </>
    );
  } else if (!isHeader && content && style?.presentationSettings?.wrap === false && typeof content === "string") {
    // In order to truncate the text properly, then we need to wrap it in another element
    // as our cell element is a flex container, which don't allow for applying truncation styles directly on it.
    return (
      <>
        <span css={Css.truncate.mw0.$} title={content}>
          {content}
        </span>
        {tooltipEl}
      </>
    );
  } else if (!isHeader && !isExpandableHeader && style.emptyCell && isContentEmpty(content)) {
    // If the content is empty and the user specified an `emptyCell` node, return that.
    return style.emptyCell;
  }
  return (
    <>
      {content}
      {tooltipEl}
    </>
  );
}

export function isGridCellContent(content: ReactNode | GridCellContent): content is GridCellContent {
  return typeof content === "object" && !!content && "content" in content;
}

const emptyValues = ["", null, undefined] as any[];

function isContentEmpty(content: ReactNode): boolean {
  return emptyValues.includes(content);
}

export type DragData<R extends Kinded> = {
  rowRenderRef: React.RefObject<HTMLTableRowElement>;
  onDragStart?: (row: GridDataRow<R>, event: React.DragEvent<HTMLElement>) => void;
  onDragEnd?: (row: GridDataRow<R>, event: React.DragEvent<HTMLElement>) => void;
  onDrop?: (row: GridDataRow<R>, event: React.DragEvent<HTMLElement>) => void;
  onDragEnter?: (row: GridDataRow<R>, event: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (row: GridDataRow<R>, event: React.DragEvent<HTMLElement>) => void;
};

/** Return the content for a given column def applied to a given row. */
export function applyRowFn<R extends Kinded>(
  column: GridColumnWithId<R>,
  row: GridDataRow<R>,
  api: GridRowApi<R>,
  level: number,
  expanded: boolean,
  dragData?: DragData<R>,
): ReactNode | GridCellContent {
  // Usually this is a function to apply against the row, but sometimes it's a hard-coded value, i.e. for headers
  const maybeContent = column[row.kind];
  if (typeof maybeContent === "function") {
    // Auto-destructure data
    return (maybeContent as Function)((row as any)["data"], { row: row as any, api, level, expanded, dragData });
  } else {
    return maybeContent;
  }
}

export const ASC = "ASC" as const;
export const DESC = "DESC" as const;
export const emptyCell: GridCellContent = { content: () => <></>, value: "" };

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
  let maybeFn: any = value;
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
/** Tables expandable columns get an extra header. */
export const EXPANDABLE_HEADER = "expandableHeader";
export const KEPT_GROUP = "keptGroup";
export const reservedRowKinds = [HEADER, TOTALS, EXPANDABLE_HEADER, KEPT_GROUP];

export const zIndices = {
  stickyHeader: 4,
  stickyColumns: 3,
  expandableHeaderTitle: 2,
  expandableHeaderIcon: 1,
};

/** Loads an array from sessionStorage, if it exists, or `undefined`. */
export function loadArrayOrUndefined(key: string) {
  const ids = sessionStorage.getItem(key);
  return ids ? JSON.parse(ids) : undefined;
}

export function insertAtIndex<T>(array: Array<T>, element: T, index: number): Array<T> {
  return [...array.slice(0, index), element, ...array.slice(index, array.length)];
}

export function isCursorBelowMidpoint(target: HTMLElement, clientY: number) {
  const style = window.getComputedStyle(target);
  const rect = target.getBoundingClientRect();

  const pt = parseFloat(style.getPropertyValue("padding-top"));
  const pb = parseFloat(style.getPropertyValue("padding-bottom"));

  return clientY > rect.top + pt + (rect.height - pb) / 2;
}

export function recursivelyGetContainingRow<R extends Kinded>(
  rowId: string,
  rowArray: GridDataRow<R>[],
  parent?: GridDataRow<R>,
): { array: GridDataRow<R>[]; parent: GridDataRow<R> | undefined } | undefined {
  if (rowArray.some((row) => row.id === rowId)) {
    return { array: rowArray, parent };
  }

  for (let i = 0; i < rowArray.length; i++) {
    if (!rowArray[i].children) {
      continue;
    }

    const result = recursivelyGetContainingRow(rowId, rowArray[i].children!, rowArray[i]);
    if (result) {
      return result;
    }
  }

  return undefined;
}
