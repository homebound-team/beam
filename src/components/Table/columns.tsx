import { GridColumn, Kinded } from "src/components/Table/types";

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

/** Provides default styling for a GridColumn containing a checkbox. */
export function selectColumn<T extends Kinded, S = {}>(columnDef: GridColumn<T, S>): GridColumn<T, S> {
  // Defining `w: 48px` to accommodate for the `16px` wide checkbox and `16px` of padding on either side.
  return { clientSideSort: false, ...columnDef, align: "center", w: "48px" };
}

/** Provides default styling for a GridColumn containing the CollapseToggle component. */
export function collapseColumn<T extends Kinded, S = {}>(columnDef: GridColumn<T, S>): GridColumn<T, S> {
  // Defining `w: 38px` based on the designs
  return { ...columnDef, clientSideSort: false, align: "center", w: "38px" };
}
