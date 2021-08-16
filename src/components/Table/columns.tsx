import { GridColumn, Kinded } from "src/components/Table/GridTable";

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
  return { ...columnDef, align: "center" };
}
