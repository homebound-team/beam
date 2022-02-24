import React, { ReactNode } from "react";
import {
  GridCellAlignment,
  GridCellContent,
  GridColumn,
  GridDataRow,
  GridStyle,
  Kinded,
  RowStyle,
} from "src/components/Table";
import { Css, Properties } from "src/Css";
import tinycolor from "tinycolor2";

export function isGridCellContent(content: ReactNode | GridCellContent): content is GridCellContent {
  return typeof content === "object" && !!content && "content" in content;
}

export const ASC = "ASC" as const;
export const DESC = "DESC" as const;

export const emptyCell: GridCellContent = { content: () => <></>, value: "" };

const emptyValues = ["", null, undefined] as any[];
export function isContentEmpty(content: ReactNode): boolean {
  return emptyValues.includes(content);
}

/**
 * Calculates column widths using a flexible `calc()` definition that allows for consistent column alignment without the use of `<table />`, CSS Grid, etc layouts.
 * Enforces only fixed-sized units (% and px)
 */
export function calcColumnSizes(columns: GridColumn<any>[], firstLastColumnWidth: number | undefined): string[] {
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
    { claimedPercentages: 0, claimedPixels: firstLastColumnWidth ? firstLastColumnWidth * 2 : 0, totalFr: 0 },
  );

  // This is our "fake but for some reason it lines up better" fr calc
  function fr(myFr: number): string {
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

  return maybeAddCardColumns(sizes, firstLastColumnWidth);
}

// If we're doing nested cards, we add extra 1st/last cells...
function maybeAddCardColumns(sizes: string[], firstLastColumnWidth: number | undefined): string[] {
  return !firstLastColumnWidth ? sizes : [`${firstLastColumnWidth}px`, ...sizes, `${firstLastColumnWidth}px`];
}

export function getIndentationCss<R extends Kinded>(
  style: GridStyle,
  rowStyle: RowStyle<R> | undefined,
  columnIndex: number,
  maybeContent: ReactNode | GridCellContent,
): Properties {
  // Look for cell-specific indent or row-specific indent (row-specific is only one the first column)
  const indent = (isGridCellContent(maybeContent) && maybeContent.indent) || (columnIndex === 0 && rowStyle?.indent);
  return indent === 1 ? style.indentOneCss || {} : indent === 2 ? style.indentTwoCss || {} : {};
}

export function getFirstOrLastCellCss<R extends Kinded>(
  style: GridStyle,
  columnIndex: number,
  columns: GridColumn<R>[],
): Properties {
  return {
    ...(columnIndex === 0 ? style.firstCellCss : {}),
    ...(columnIndex === columns.length - 1 ? style.lastCellCss : {}),
  };
}

/** Return the content for a given column def applied to a given row. */
export function applyRowFn<R extends Kinded>(column: GridColumn<R>, row: GridDataRow<R>): ReactNode | GridCellContent {
  // Usually this is a function to apply against the row, but sometimes it's a hard-coded value, i.e. for headers
  const maybeContent = column[row.kind];
  if (typeof maybeContent === "function") {
    if ("data" in row && "id" in row) {
      // Auto-destructure data
      return (maybeContent as Function)((row as any)["data"], (row as any)["id"]);
    } else {
      return (maybeContent as Function)(row);
    }
  } else {
    return maybeContent;
  }
}

export const alignmentToJustify: Record<GridCellAlignment, Properties["justifyContent"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};
const alignmentToTextAlign: Record<GridCellAlignment, Properties["textAlign"]> = {
  left: "left",
  center: "center",
  right: "right",
};

export function getAlignment(column: GridColumn<any>, maybeContent: ReactNode | GridCellContent): GridCellAlignment {
  return (isGridCellContent(maybeContent) && maybeContent.alignment) || column.align || "left";
}

// For alignment, use: 1) cell def, else 2) column def, else 3) left.
export function getJustification(alignment: GridCellAlignment) {
  return Css.jc(alignmentToJustify[alignment]).add("textAlign", alignmentToTextAlign[alignment]).$;
}

/** Look at a row and get its filter value. */
export function filterValue(value: ReactNode | GridCellContent): any {
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
  let value = filterValue(maybeContent);
  if (typeof value === "string") {
    return value.toLowerCase().includes(filter.toLowerCase());
  } else if (typeof value === "number") {
    return Number(filter) === value;
  }
  return false;
}

export function maybeDarken(color: string | undefined, defaultColor: string): string {
  return color ? tinycolor(color).darken(4).toString() : defaultColor;
}
