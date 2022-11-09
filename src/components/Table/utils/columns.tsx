import { CollapseToggle } from "src/components/Table/components/CollapseToggle";
import { GridDataRow } from "src/components/Table/components/Row";
import { SelectToggle } from "src/components/Table/components/SelectToggle";
import { GridColumn, GridColumnWithId, Kinded, nonKindGridColumnKeys } from "src/components/Table/types";
import { emptyCell } from "src/components/Table/utils/utils";
import { newMethodMissingProxy } from "src/utils";

/** Provides default styling for a GridColumn representing a Date. */
export function column<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { ...columnDef };
}

/** Provides default styling for a GridColumn representing a Date. */
export function dateColumn<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { ...columnDef, align: "left" };
}

/**
 * Provides default styling for a GridColumn representing a Numeric value (Price, percentage, PO #, etc.). */
export function numericColumn<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { ...columnDef, align: "right" };
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
    // Defining `w: 48px` to accommodate for the `16px` wide checkbox and `16px` of padding on either side.
    w: "48px",
    wrapAction: false,
    isAction: true,
    expandColumns: undefined,
    // Select Column should not display the select toggle for `expandableHeader` or `totals` row kinds
    expandableHeader: emptyCell,
    totals: emptyCell,
    // Use any of the user's per-row kind methods if they have them.
    ...columnDef,
  };
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
    expandColumns: undefined,
    // Collapse Column should not display the collapse toggle for `expandableHeader` or `totals` row kinds
    expandableHeader: emptyCell,
    totals: emptyCell,
    ...columnDef,
  };
  return newMethodMissingProxy(base, (key) => {
    return (data: any, { row, level }: { row: GridDataRow<any>; level: number }) => ({
      content: <CollapseToggle row={row} compact={level > 0} />,
    });
  }) as any;
}

// Keep keys like `w` and `mw` from hitting the method missing proxy
function nonKindDefaults() {
  return Object.fromEntries(nonKindGridColumnKeys.map((key) => [key, undefined]));
}

/**
 * Calculates column widths using a flexible `calc()` definition that allows for consistent column alignment without the use of `<table />`, CSS Grid, etc layouts.
 * Enforces only fixed-sized units (% and px)
 */
export function calcColumnSizes(
  columns: GridColumnWithId<any>[],
  tableWidth: number | undefined,
  tableMinWidthPx: number = 0,
  expandedColumnIds: string[],
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
    (acc, { id, w: _w, expandColumns }) => {
      const w = expandedColumnIds.includes(id) && !Array.isArray(expandColumns) ? expandColumns : _w;

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

  // This is our "fake but for some reason it lines up better" fr calc
  function fr(myFr: number): string {
    // If the tableWidth, then return a pixel value
    if (tableWidth) {
      const widthBasis = Math.max(tableWidth, tableMinWidthPx);
      return `(${(widthBasis - (claimedPercentages / 100) * widthBasis - claimedPixels) * (myFr / totalFr)}px)`;
    }
    // Otherwise return the `calc()` value
    return `((100% - ${claimedPercentages}% - ${claimedPixels}px) * (${myFr} / ${totalFr}))`;
  }

  let sizes = columns.map(({ id, expandColumns, w: _w }) => {
    const w = expandedColumnIds.includes(id) && !Array.isArray(expandColumns) ? expandColumns : _w;

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

  return sizes;
}

/** Assign column ids if missing */
export function assignDefaultColumnIds<T extends Kinded>(columns: GridColumn<T>[]): GridColumnWithId<T>[] {
  // Note: we are not _always_ spreading the `c` property as we need to be able to return the whole proxy object that
  // exists as part of `selectColumn` and `collapseColumn`.
  return columns.map((c, idx) => {
    const { expandColumns } = c;
    const expandColumnsWithId: GridColumnWithId<T>[] | number | string | undefined =
      expandColumns === undefined
        ? undefined
        : Array.isArray(expandColumns)
        ? expandColumns.map((ec, ecIdx) => ({
            ...ec,
            id: ec.id ?? (`${generateColumnId(idx)}_${ecIdx}` as string),
            // Defining this as undefined to make TS happy for now.
            // If we do not explicitly set to `undefined`, TS thinks `expandColumns` could still be of type GridColumn<T> (not WithId).
            // We only support a single level of expanding columns, so this is safe to do.
            expandColumns: undefined,
          }))
        : expandColumns;

    return Object.assign(c, { id: c.id ?? generateColumnId(idx), expandColumns: expandColumnsWithId });
  });
}

export const generateColumnId = (columnIndex: number) => `beamColumn_${columnIndex}`;
