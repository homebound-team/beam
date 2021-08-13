import { GridColumn, Kinded } from "src/components/Table/GridTable";

/**
 * Provides default styling for a GridColumn representing a Date
 * Defaults to a `0fr` grid-template-column width, which results in the column taking up only the width required to fit the content.
 */
export function dateColumn<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { w: 0, ...columnDef, align: "left" };
}

/**
 * Provides default styling for a GridColumn representing a Numeric value (Price, percentage, PO #, etc.)
 * Defaults to a `0fr` grid-template-column width, which results in the column taking up only the width required to fit the content.
 */
export function numericColumn<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { w: 0, ...columnDef, align: "right" };
}

/**
 * Provides default styling for a GridColumn representing an Action
 * Defaults to a `0fr` grid-template-column width, which results in the column taking up only the width required to fit the content.
 */
export function actionColumn<T extends Kinded>(columnDef: GridColumn<T>): GridColumn<T> {
  return { w: 0, ...columnDef, align: "center" };
}
