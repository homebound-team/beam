import type { GridDataRow } from "src/components/Table/components/Row";
import type { GridTableApi } from "src/components/Table/GridTableApi";
import type {
  GridColumn,
  GridRowAction,
  GridRowActionsConfig,
  Kinded,
  RowActionsColumnDef,
} from "src/components/Table/types";
import { reservedRowKinds } from "src/components/Table/utils/utils";

export const beamRowActionsColumnId = "beamRowActionsColumn";

/** Icons in the table's row controls draw at 18x18. */
export const tableIconInc = 2.25;

/** The 28px icon button, the 4px gap between buttons, and the cell's 12px side padding. */
const rowActionButtonPx = 28;
export const rowActionGapPx = 4;
const rowActionsCellPaddingPx = 12;

/** The fixed number of buttons the actions column is sized for, the menu included: 3, or the pin and the menu on phone-sized screens. */
export function rowActionsSlotsFor(breakpoints: { sm: boolean }): number {
  return breakpoints.sm ? 2 : 3;
}

/**
 * How a row's actions split: `icons` before the pin (always an icon, never in the menu), then the "overflow" menu if
 * any actions are left over. The icons, pin included, fit in `visibleCount`. `overflowOnly` actions skip the icons
 * and go straight to the menu; the rest fill the icons in order.
 *
 * The menu never holds just one action: a lone leftover action (`overflowOnly` or not) takes the menu's slot as an
 * icon instead. So without the pin on phone-sized screens, a single action is an icon, and two or more all go in the menu.
 */
export function splitRowActions<A extends Pick<GridRowAction, "overflowOnly">>(
  actions: A[],
  pinnable: boolean,
  visibleCount: number,
): { icons: A[]; menu: A[] } {
  const fits = Math.max(0, visibleCount - (pinnable ? 1 : 0));
  const icons = actions.filter((a) => !a.overflowOnly).slice(0, fits);
  const menu = actions.filter((a) => !icons.includes(a));
  return menu.length === 1 ? { icons: actions, menu: [] } : { icons, menu };
}

/** Width of the actions column for `slots` icon buttons. */
export function rowActionsColumnPx(slots: number): number {
  return rowActionsCellPaddingPx * 2 + slots * rowActionButtonPx + (slots - 1) * rowActionGapPx;
}

/** Each `rowActionsColumn`'s def, so the table can check its rows' configs without another column option. */
const rowActionsDefs = new WeakMap<object, RowActionsColumnDef<any>>();

export function setRowActionsDef<R extends Kinded>(column: GridColumn<R>, def: RowActionsColumnDef<R>): void {
  rowActionsDefs.set(column, def);
}

/** Whether any row (children included) gets a pin from the table's `rowActionsColumn`. */
export function anyRowActionsPinnable<R extends Kinded>(
  columns: GridColumn<R>[],
  rows: GridDataRow<R>[],
  api: GridTableApi<R>,
): boolean {
  const column = columns.find((c) => c.id === beamRowActionsColumnId);
  const def = column && rowActionsDefs.get(column);
  if (!def) return false;
  const anyPinnable = (rows: GridDataRow<R>[]): boolean =>
    rows.some((row) => !!resolveRowActions(def, row, api).pinnable || anyPinnable(row.children ?? []));
  return anyPinnable(rows);
}

/**
 * Makes the `rowActionsColumn` sticky to the right when `sticky` is set, i.e. when rows are pinnable, whatever the
 * column's own `sticky` option says. Wraps the column like `withRowActionsWidth`, so the caller's column is untouched.
 */
export function withRowActionsSticky<T extends Kinded>(columns: GridColumn<T>[], sticky: boolean): GridColumn<T>[] {
  if (!sticky) return columns;
  return columns.map((column) =>
    column.id === beamRowActionsColumnId
      ? new Proxy(column, { get: (target, key) => (key === "sticky" ? "right" : Reflect.get(target, key)) })
      : column,
  );
}

/** Resolves a row's `rowActionsColumn` config: static, or computed from the row. Reserved rows never get one. */
export function resolveRowActions<R extends Kinded>(
  def: RowActionsColumnDef<R>,
  row: GridDataRow<R>,
  api: GridTableApi<R>,
): GridRowActionsConfig {
  if (reservedRowKinds.includes(row.kind)) return {};
  const config = (def as Record<string, unknown>)[row.kind];
  return (typeof config === "function" ? config(row.data, { row, api }) : config) ?? {};
}
