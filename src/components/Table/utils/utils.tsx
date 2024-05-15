import { ReactNode } from "react";
import { Icon } from "src/components/Icon";
import { GridCellContent } from "src/components/Table/components/cell";
import { GridDataRow } from "src/components/Table/components/Row";
import { GridRowApi } from "src/components/Table/GridTableApi";
import { GridStyle } from "src/components/Table/TableStyles";
import { GridCellAlignment, GridColumnWithId, Kinded, RenderAs } from "src/components/Table/types";
import { Css, Palette, Properties } from "src/Css";

export function getGridCellContentProp<K extends keyof GridCellContent>(
  content: ReactNode | GridCellContent,
  prop: K,
  defaultValue?: GridCellContent[K],
): GridCellContent[K] | undefined {
  if (isGridCellContent(content)) {
    return content[prop];
  }
  return defaultValue ?? undefined;
}

export function isGridCellContent(content: ReactNode | GridCellContent): content is GridCellContent {
  return typeof content === "object" && !!content && "content" in content;
}

const emptyValues = ["", null, undefined] as any[];

export function isContentEmpty(content: ReactNode): boolean {
  return emptyValues.includes(content);
}

export function getTooltipIcon(maybeContent: ReactNode | GridCellContent) {
  const tooltip = getGridCellContentProp(maybeContent, "tooltip");
  return tooltip ? (
    <span css={Css.fs0.mlPx(4).$}>
      <Icon icon="infoCircle" tooltip={tooltip} inc={2} color={Palette.Gray600} />
    </span>
  ) : null;
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
export function isJSX(content: any): boolean {
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

export function getTableRefWidthStyles(isVirtual: boolean) {
  // If virtualized take some pixels off the width to accommodate when virtuoso's scrollbar is introduced.
  // Otherwise a horizontal scrollbar will _always_ appear once the vertical scrollbar is needed
  return Css.w100.if(isVirtual).w("calc(100% - 20px)").$;
}
