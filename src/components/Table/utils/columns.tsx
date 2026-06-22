import { Icon } from "src";
import { CollapseToggle } from "src/components/Table/components/CollapseToggle";
import { PinToggle } from "src/components/Table/components/PinToggle";
import type { GridDataRow } from "src/components/Table/components/Row";
import { SelectToggle } from "src/components/Table/components/SelectToggle";
import { ResizedWidths } from "src/components/Table/hooks/useColumnResizing";
import { GridColumn, GridColumnWithId, Kinded, nonKindGridColumnKeys } from "src/components/Table/types";
import { DragData, emptyCell } from "src/components/Table/utils/utils";
import { Css } from "src/Css";
import { isFunction, newMethodMissingProxy } from "src/utils";

/** Provides default styling for a GridColumn representing a Date. */
export function column<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { canHide: true, initHidden: false, ...columnDef };
}

/** Provides default styling for a GridColumn representing a Date. */
export function dateColumn<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { canHide: true, initHidden: false, ...columnDef, align: "left" };
}

/**
 * Provides default styling for a GridColumn representing a Numeric value (Price, percentage, PO #, etc.). */
export function numericColumn<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { canHide: true, initHidden: false, ...columnDef, align: "right" };
}

/** Provides default styling for a GridColumn representing an Action. */
export function actionColumn<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { clientSideSort: false, ...columnDef, align: "center", isAction: true, wrapAction: false };
}

/**
 * Provides default styling for a GridColumn containing a checkbox.
 *
 * We allow either no `columnDef` at all, or a partial column def (i.e. to say a Totals row should
 * not have a `SelectToggle`, b/c we can provide the default behavior a `SelectToggle` for basically
 * all rows.
 */
export function selectColumn<T extends Kinded>(columnDef?: Partial<GridColumn<T>>): GridColumn<T> {
  const base = {
    ...nonKindDefaults(),
    id: "beamSelectColumn",
    clientSideSort: false,
    align: "center",
    // Defining `w: 40px` to accommodate for the `16px` wide checkbox and `12px` of padding on either side.
    w: "40px",
    wrapAction: false,
    isAction: true,
    // Select Column should not display the select toggle for `expandableHeader` or `totals` row kinds
    expandableHeader: emptyCell,
    totals: emptyCell,
    // Use any of the user's per-row kind methods if they have them.
    ...columnDef,
  };
  // Use newMethodMissingProxy so the user can use whatever kinds they want, i.e. `myRowKind: () => ...Toggle... `
  return newMethodMissingProxy(base, (key) => {
    return (data: any, { row }: { row: GridDataRow<any> }) => ({
      content: <SelectToggle id={row.id} disabled={row.selectable === false} />,
    });
  }) as any;
}

/**
 * Provides default styling for a GridColumn containing a collapse icon.
 *
 * We allow either no `columnDef` at all, or a partial column def (i.e. to say a Totals row should
 * not have a `CollapseToggle`, b/c we can provide the default behavior a `CollapseToggle` for basically
 * all rows.
 */
export function collapseColumn<T extends Kinded>(columnDef?: Partial<GridColumn<T>>): GridColumn<T> {
  const base = {
    ...nonKindDefaults(),
    id: "beamCollapseColumn",
    clientSideSort: false,
    align: "center",
    // Defining `w: 38px` based on the designs
    w: "38px",
    wrapAction: false,
    isAction: true,
    // Collapse Column should not display the collapse toggle for `expandableHeader` or `totals` row kinds
    expandableHeader: emptyCell,
    totals: emptyCell,
    ...columnDef,
  };
  // Use newMethodMissingProxy so the user can use whatever kinds they want, i.e. `myRowKind: () => ...Collapse... `
  return newMethodMissingProxy(base, (key) => {
    return (data: any, { row, level }: { row: GridDataRow<any>; level: number }) => ({
      content: <CollapseToggle row={row} compact={level > 0} />,
    });
  }) as any;
}

/**
 * Provides a GridColumn containing a {@link PinToggle} to pin/unpin rows to the top at runtime.
 *
 * Like `selectColumn`/`collapseColumn`, this accepts no `columnDef` or a partial one. The toggle is
 * rendered for data rows by default; header/totals/expandableHeader get an `emptyCell` since there's
 * no "pin all" concept and reserved rows aren't pinnable.
 *
 * Note: pinning a parent row hoists only that row into the sticky pinned section — its children stay in place.
 */
export function pinColumn<T extends Kinded>(columnDef?: Partial<GridColumn<T>>): GridColumn<T> {
  const base = {
    ...nonKindDefaults(),
    id: "beamPinColumn",
    clientSideSort: false,
    align: "center",
    // 40px to accommodate the pin IconButton + padding, matching selectColumn.
    w: "40px",
    wrapAction: false,
    isAction: true,
    header: emptyCell,
    expandableHeader: emptyCell,
    totals: emptyCell,
    // Use any of the user's per-row kind methods if they have them.
    ...columnDef,
  };
  // Use newMethodMissingProxy so the user can use whatever kinds they want, i.e. `myRowKind: () => ...Pin... `
  return newMethodMissingProxy(base, (key) => {
    return (data: any, { row }: { row: GridDataRow<any> }) => ({
      content: <PinToggle id={row.id} />,
    });
  }) as any;
}

/** Hardcoded to match page content inset (pl3/pr3). Unifying layout spacing is a separate effort. */
const columnGutterPx = 12;

export const layoutGutterLeftColumnId = "beamLayoutGutterLeft";
export const layoutGutterRightColumnId = "beamLayoutGutterRight";

/** True for columns that display row data (not action controls or layout gutters). */
export function isContentColumn(column: Pick<GridColumn<Kinded>, "isAction" | "isLayoutGutter">): boolean {
  return !column.isAction && !column.isLayoutGutter;
}

/** Empty fixed-width column inset for document-scroll table layouts. */
function layoutGutterColumn<T extends Kinded>(side: "left" | "right"): GridColumn<T> {
  const id = side === "left" ? layoutGutterLeftColumnId : layoutGutterRightColumnId;
  const base = {
    ...nonKindDefaults(),
    id,
    clientSideSort: false,
    w: `${columnGutterPx}px`,
    wrapAction: false,
    isLayoutGutter: true,
    canHide: false,
    expandableHeader: emptyCell,
    totals: emptyCell,
  };
  return newMethodMissingProxy(base, () => () => emptyCell) as GridColumn<T>;
}

/** Prepends and appends layout gutter columns for document-scroll table alignment. */
export function withColumnGutters<T extends Kinded>(columns: GridColumn<T>[]): GridColumn<T>[] {
  return [layoutGutterColumn("left"), ...columns, layoutGutterColumn("right")];
}

// Keep keys like `w` and `mw` from hitting the method missing proxy
function nonKindDefaults() {
  return Object.fromEntries(nonKindGridColumnKeys.map((key) => [key, undefined]));
}

export function parseWidthToPx(widthStr: string | undefined, tableWidth: number | undefined): number | null {
  if (!widthStr) return null;

  if (widthStr.endsWith("px")) {
    const parsed = parseFloat(widthStr.replace("px", ""));
    return isNaN(parsed) ? null : parsed;
  }

  if (widthStr.endsWith("%") && tableWidth !== undefined) {
    const percent = parseFloat(widthStr.replace("%", ""));
    if (isNaN(percent)) return null;
    return Math.round((percent / 100) * tableWidth);
  }

  // For calc() or other complex expressions, return null
  // These should never happen since we've run calcColumnSizes already resolved to px
  // by the time resizing happens
  return null;
}

/** Sum resolved column sizes in px; returns null when any size is still a calc() expression. */
export function sumColumnSizesPx(columnSizes: string[], tableWidth: number | undefined): number | null {
  if (tableWidth === undefined) return null;

  let sum = 0;
  for (const size of columnSizes) {
    const px = parseWidthToPx(size, tableWidth);
    if (px === null) return null;
    sum += px;
  }

  return sum;
}

/** Split resolved column sizes into fixed px vs row-relative % portions. */
function sumColumnSizeParts(columnSizes: string[]): { pxSum: number; percentSum: number; hasCalc: boolean } {
  let pxSum = 0;
  let percentSum = 0;
  let hasCalc = false;

  for (const size of columnSizes) {
    if (size.endsWith("px")) {
      pxSum += parseFloat(size.replace("px", ""));
    } else if (size.endsWith("%")) {
      percentSum += parseFloat(size.replace("%", ""));
    } else {
      hasCalc = true;
    }
  }

  return { pxSum, percentSum, hasCalc };
}

/** Table content width: at least the measured container and a self-consistent width for literal % columns. */
export function resolveTableContentWidth(
  tableWidth: number | undefined,
  columnSizes: string[],
  minWidthPx: number = 0,
): number | undefined {
  if (tableWidth === undefined) return undefined;

  const { pxSum, percentSum, hasCalc } = sumColumnSizeParts(columnSizes);

  // fixedPx + (percent/100) * rowWidth = rowWidth  →  rowWidth = fixedPx / (1 - percent/100)
  if (!hasCalc && percentSum > 0 && percentSum < 100) {
    const selfConsistent = pxSum / (1 - percentSum / 100);
    return Math.max(tableWidth, minWidthPx, Math.ceil(selfConsistent));
  }

  const sum = sumColumnSizesPx(columnSizes, tableWidth);
  if (sum === null) return undefined;

  return Math.max(tableWidth, sum, minWidthPx);
}

/**
 * Calculates column widths using a flexible `calc()` definition that allows for consistent column alignment without the use of `<table />`, CSS Grid, etc layouts.
 * Enforces only fixed-sized units (% and px)
 */
export function calcColumnSizes<R extends Kinded>(
  columns: GridColumnWithId<R>[],
  tableWidth: number | undefined,
  tableMinWidthPx: number = 0,
  expandedColumnIds: string[],
  resizedWidths?: ResizedWidths,
): string[] {
  // For both default columns (1fr) as well as `w: 4fr` columns, we translate the width into an expression that looks like:
  // calc((100% - allOtherPercent - allOtherPx) * ((myFr / totalFr))`
  //
  // Which looks _a lot_ like how `fr` units just work out-of-the-box.
  //
  // Unfortunately, something about having our header & body rows in separate divs (which is controlled
  // by react-virtuoso), even if they have the same width, for some reason `fr` units between the two
  // will resolve every slightly differently, where as this approach they will match exactly.
  const { claimedPercentages, claimedPixels, totalFr } = columns.reduce(
    (acc, { id, w: _w, expandedWidth }) => {
      // Use resized width if available, otherwise use expanded width or original width
      const resizedWidth = resizedWidths?.[id];
      const w =
        resizedWidth !== undefined
          ? `${resizedWidth}px`
          : expandedColumnIds.includes(id) && expandedWidth !== undefined
            ? expandedWidth
            : _w;

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
    { claimedPercentages: 0, claimedPixels: 0, totalFr: 0 },
  );

  // In the event a column defines a fractional unit (fr) as the `w` value and a `mw` value in pixels,
  // it is possible that the min-width value will kick in and throw off our claimedPixel and totalFr calculations.
  // Once a `tableWidth` is defined, then we can adjust the claimedPixels and totalFr based on minWidth being present for any columns
  let adjustedClaimedPixels = claimedPixels;
  let adjustedTotalFr = totalFr;
  if (tableWidth) {
    columns.forEach(({ w, mw }) => {
      const frUnit = parseFr(w);
      if (mw === undefined || frUnit === undefined) return;

      const mwPx = Number(mw.replace("px", ""));
      const calcedWidth =
        (tableWidth - (claimedPercentages / 100) * tableWidth - adjustedClaimedPixels) * (frUnit / adjustedTotalFr);
      // If the calculated width is less than the minWidth, then this column will be sized via pixels instead of `fr` units.
      if (calcedWidth < mwPx) {
        // Adjust the claimedPixels and totalFr accordingly
        adjustedClaimedPixels += mwPx;
        adjustedTotalFr -= frUnit;
      }
    });
  }

  // This is our "fake but for some reason it lines up better" fr calc
  function fr(myFr: number, mw: number): string {
    // If the tableWidth, then return a pixel value
    if (tableWidth) {
      const widthBasis = Math.max(tableWidth, tableMinWidthPx);
      const calcedWidth =
        (widthBasis - (claimedPercentages / 100) * widthBasis - adjustedClaimedPixels) * (myFr / adjustedTotalFr);

      return `${Math.max(calcedWidth, mw)}px`;
    }
    // Otherwise return the `calc()` value
    return `((100% - ${claimedPercentages}% - ${claimedPixels}px) * (${myFr} / ${totalFr}))`;
  }

  const sizes = columns.map(({ id, expandedWidth, w: _w, mw: _mw }) => {
    // Ensure `mw` is a pixel value if defined
    if (_mw !== undefined && !_mw.endsWith("px")) {
      throw new Error("Beam Table column minWidth definition only supports pixel units");
    }
    const mw = _mw ? Number(_mw.replace("px", "")) : 0;
    // Use resized width if available, otherwise use expanded width or original width
    const resizedWidth = resizedWidths?.[id];
    const w =
      resizedWidth !== undefined
        ? `${resizedWidth}px`
        : expandedColumnIds.includes(id) && expandedWidth !== undefined
          ? expandedWidth
          : _w;

    if (typeof w === "undefined") {
      return fr(1, mw);
    } else if (typeof w === "string") {
      if (w.endsWith("%") || w.endsWith("px")) {
        return w;
      } else if (w.endsWith("fr")) {
        return fr(Number(w.replace("fr", "")), mw);
      } else {
        throw new Error("Beam Table column width definition only supports px, percentage, or fr units");
      }
    } else {
      return fr(w, mw);
    }
  });

  return sizes;
}

export type ColumnLayoutResult = {
  columnSizes: string[];
  /** Row width required by column defs; equals probe width when no expansion (or legacy path). */
  contentWidth: number | undefined;
};

/** Size columns for a measured container; resolves content width when in a document-scroll layout. */
export function calcColumnLayout<R extends Kinded>(
  columns: GridColumnWithId<R>[],
  probeWidth: number | undefined,
  tableMinWidthPx: number = 0,
  expandedColumnIds: string[],
  resizedWidths: ResizedWidths | undefined,
  inDocumentScrollLayout: boolean,
): ColumnLayoutResult {
  if (probeWidth === undefined) {
    return {
      columnSizes: calcColumnSizes(columns, undefined, tableMinWidthPx, expandedColumnIds, resizedWidths),
      contentWidth: undefined,
    };
  }

  if (!inDocumentScrollLayout) {
    return {
      columnSizes: calcColumnSizes(columns, probeWidth, tableMinWidthPx, expandedColumnIds, resizedWidths),
      contentWidth: probeWidth,
    };
  }

  // Pass 1: size columns assuming the row width equals the measured container (probe).
  let columnSizes = calcColumnSizes(columns, probeWidth, tableMinWidthPx, expandedColumnIds, resizedWidths);

  // Literal % columns and mw floors can require a row wider than the probe.
  const contentWidth = resolveTableContentWidth(probeWidth, columnSizes, tableMinWidthPx) ?? probeWidth;

  // Re-run fr→px at the content width when expansion is meaningful; literal % columns stay as-is.
  // Skip re-run when expansion is ≤1px (rounding noise from % resolution at the probe).
  if (contentWidth > probeWidth + 1) {
    columnSizes = calcColumnSizes(columns, contentWidth, tableMinWidthPx, expandedColumnIds, resizedWidths);
  }

  return { columnSizes, contentWidth };
}

/** Assign column ids if missing. */
export function assignDefaultColumnIds<T extends Kinded>(columns: GridColumn<T>[]): GridColumnWithId<T>[] {
  return columns.map((c, idx) => {
    const { expandColumns } = c;
    // If `expandColumns` is a function, we don't instrument it atm.
    const expandColumnsWithId = isFunction(expandColumns)
      ? expandColumns
      : expandColumns?.map((ec, ecIdx) => ({
          ...ec,
          id: ec.id ?? `${generateColumnId(idx)}_${ecIdx}`,
          // Defining this as undefined to make TS happy for now.
          // If we do not explicitly set to `undefined`, TS thinks `expandColumns` could still be of type GridColumn<T> (not WithId).
          // We only support a single level of expanding columns, so this is safe to do.
          expandColumns: undefined,
        }));
    // We use `Object.assign` instead of spreading the `c` property to maintain
    // the proxy objects if the user used selectColumn/collapseColumn, which have
    // method-missing hooks that render empty cells for any non-header rows.
    return Object.assign(c, {
      id: c.id ?? generateColumnId(idx),
      expandColumns: expandColumnsWithId,
    });
  });
}

export const generateColumnId = (columnIndex: number) => `beamColumn_${columnIndex}`;

export function dragHandleColumn<T extends Kinded>(columnDef?: Partial<GridColumn<T>>): GridColumn<T> {
  const base = {
    ...nonKindDefaults(),
    id: "beamDragHandleColumn",
    clientSideSort: false,
    align: "center",
    w: "40px",
    wrapAction: false,
    isAction: true,
    expandableHeader: emptyCell,
    totals: emptyCell,
    // Use any of the user's per-row kind methods if they have them.
    ...columnDef,
  };

  return newMethodMissingProxy(base, (key) => {
    return (data: any, { row, dragData }: { row: GridDataRow<T>; dragData: DragData<T> }) => {
      if (!dragData) return;
      const { rowRenderRef: ref, onDragStart, onDragEnd, onDrop, onDragEnter, onDragOver } = dragData;

      return {
        content: row.draggable ? (
          <div
            draggable={row.draggable}
            onDragStart={(evt) => {
              // show the whole row being dragged when dragging with the handle
              ref.current && evt.dataTransfer.setDragImage(ref.current, 0, 0);
              return onDragStart?.(row, evt);
            }}
            onDragEnd={(evt) => onDragEnd?.(row, evt)}
            onDrop={(evt) => onDrop?.(row, evt)}
            onDragEnter={(evt) => onDragEnter?.(row, evt)}
            onDragOver={(evt) => onDragOver?.(row, evt)}
            css={Css.ma.cursorPointer.$}
          >
            <Icon icon="drag" />
          </div>
        ) : undefined,
      };
    };
  }) as any;
}

function parseFr(w: string | number | undefined): number | undefined {
  return typeof w === "number"
    ? w
    : typeof w === "undefined"
      ? 1
      : typeof w === "string" && w.endsWith("fr")
        ? Number(w.replace("fr", ""))
        : undefined;
}
