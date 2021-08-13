import { GridColumn, Kinded } from "src/components/Table/GridTable";

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
  return { ...columnDef, align: "center" };
}
