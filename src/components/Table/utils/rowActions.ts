import type { GridDataRow } from "src/components/Table/components/Row";
import type { GridTableApi } from "src/components/Table/GridTableApi";
import type { GridRowActionsConfig, Kinded, RowActionsColumnDef } from "src/components/Table/types";
import { reservedRowKinds } from "src/components/Table/utils/utils";

export const beamRowActionsColumnId = "beamRowActionsColumn";

/** Icons in the table's row controls draw at 18x18. */
export const tableIconInc = 2.25;

/** The 28px icon button, the 4px gap between buttons, and the cell's 12px side padding. */
const rowActionButtonPx = 28;
export const rowActionGapPx = 4;
const rowActionsCellPaddingPx = 12;

/** How many icons (the pin included) show before actions move into the "more" menu; Beam's rule, not a table option. */
export function rowActionsVisibleCount(breakpoints: { sm: boolean }): number {
  return breakpoints.sm ? 0 : 3;
}

/**
 * How a row's actions split: the first `actionIcons` as icons, then the pin (always an icon, never in the menu),
 * then the "more" menu if any actions are left over. `slots` is the number of buttons that takes.
 */
export function splitRowActions(
  actionCount: number,
  pinnable: boolean,
  visibleCount: number,
): { actionIcons: number; hasMenu: boolean; slots: number } {
  const actionIcons = Math.min(actionCount, Math.max(0, visibleCount - (pinnable ? 1 : 0)));
  const hasMenu = actionCount > actionIcons;
  return { actionIcons, hasMenu, slots: actionIcons + (pinnable ? 1 : 0) + (hasMenu ? 1 : 0) };
}

/** Width of the actions column for `slots` icon buttons. */
export function rowActionsColumnPx(slots: number): number {
  return rowActionsCellPaddingPx * 2 + slots * rowActionButtonPx + (slots - 1) * rowActionGapPx;
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

/** The most buttons any body row draws, which sizes the actions column. */
export function maxRowActionSlots<R extends Kinded>(
  rows: GridDataRow<R>[],
  resolve: (row: GridDataRow<R>) => GridRowActionsConfig,
  visibleCount: number,
): number {
  return rows.reduce((max, row) => {
    const { actions = [], pinnable = false } = resolve(row);
    const own = splitRowActions(actions.length, pinnable, visibleCount).slots;
    const children = row.children ? maxRowActionSlots(row.children, resolve, visibleCount) : 0;
    return Math.max(max, own, children);
  }, 0);
}
