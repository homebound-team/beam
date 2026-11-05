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

/** The fixed number of buttons the actions column is sized for, the menu included: 3, or the pin and the menu on phone-sized screens. */
export function rowActionsSlotsFor(breakpoints: { sm: boolean }): number {
  return breakpoints.sm ? 2 : 3;
}

/**
 * How a row's actions split: the first `actionIcons` as icons, then the pin (always an icon, never in the menu),
 * then the "more" menu if any actions are left over. The icons, pin included, fit in `visibleCount`.
 *
 * The menu never holds just one action: a lone leftover action takes the menu's slot as an icon instead.
 * So without the pin on phone-sized screens, a single action is an icon, and two or more all go in the menu.
 */
export function splitRowActions(
  actionCount: number,
  pinnable: boolean,
  visibleCount: number,
): { actionIcons: number; hasMenu: boolean } {
  const fits = Math.max(0, visibleCount - (pinnable ? 1 : 0));
  const actionIcons = actionCount - fits <= 1 ? actionCount : fits;
  return { actionIcons, hasMenu: actionCount > actionIcons };
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
