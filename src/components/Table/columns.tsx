import { GridColumn, Kinded, nonKindGridColumnKeys } from "src/components/Table/GridTable";
import { SelectToggle } from "src/components/Table/SelectToggle";
import { newMethodMissingProxy } from "src/utils/index";

/** Provides default styling for a GridColumn representing a Date. */
export function column<T extends Kinded, S = {}>(columnDef: GridColumn<T, S>): GridColumn<T, S> {
  return { ...columnDef };
}

/** Provides default styling for a GridColumn representing a Date. */
export function dateColumn<T extends Kinded, S = {}>(columnDef: GridColumn<T, S>): GridColumn<T, S> {
  return { ...columnDef, align: "left" };
}

/**
 * Provides default styling for a GridColumn representing a Numeric value (Price, percentage, PO #, etc.). */
export function numericColumn<T extends Kinded, S = {}>(columnDef: GridColumn<T, S>): GridColumn<T, S> {
  return { ...columnDef, align: "right" };
}

/** Provides default styling for a GridColumn representing an Action. */
export function actionColumn<T extends Kinded, S = {}>(columnDef: GridColumn<T, S>): GridColumn<T, S> {
  return { clientSideSort: false, ...columnDef, align: "center" };
}

/**
 *  Provides default styling for a GridColumn containing a checkbox.
 *
 * We allow either no `columnDef` at all, or a partial column def (i.e. to say a Totals row should
 * not have a `SelectToggle`, b/c we can provide the default behavior a SelectToggle for basically
 * all rows.
 */
export function selectColumn<T extends Kinded, S = {}>(columnDef?: Partial<GridColumn<T, S>>): GridColumn<T, S> {
  const base = {
    clientSideSort: false,
    align: "center",
    // Defining `w: 48px` to accommodate for the `16px` wide checkbox and `16px` of padding on either side.
    w: "48px",
    // Use any of the user's per-row kind methods if they have them.
    ...columnDef,
  };
  return newMethodMissingProxy(base, (key) => {
    // Look for things like mw
    if (nonKindGridColumnKeys.includes(key)) {
      return undefined;
    }
    return (row: any) => ({ content: <SelectToggle id={row.id} /> });
  }) as any;
}

/** Provides default styling for a GridColumn containing the CollapseToggle component. */
export function collapseColumn<T extends Kinded, S = {}>(columnDef: GridColumn<T, S>): GridColumn<T, S> {
  // Defining `w: 38px` based on the designs
  return { ...columnDef, clientSideSort: false, align: "center", w: "38px" };
}
