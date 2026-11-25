import { ProgressBar } from "src/components/ProgressBar";
import { cardProgressSlot } from "src/components/Table/cardSlots";
import type { GridCellContent } from "src/components/Table/components/cell";
import { Css } from "src/Css";

export type ProgressCellOpts = Pick<GridCellContent, "tooltip" | "sticky" | "colspan" | "css" | "aiMode" | "cardSlot">;

/**
 * Builds a body cell showing a `ProgressBar` with its % label.
 *
 * - `value` is a percentage from 0 to 100; `ProgressBar` clamps anything outside that range.
 * - `null` and `undefined` render the table's `emptyCell` ("-").
 * - `value` and `sortValue` are the number, so sorting, filtering and CSV use it.
 * - The card shows the same bar, unless `cardSlot` is passed.
 * - `aiMode` paints the bar's track for the AI surface, as well as the label's AI text treatment.
 */
export function progressCell(value: number | null | undefined, opts: ProgressCellOpts = {}): GridCellContent {
  const { cardSlot, ...common } = opts;

  if (value === null || value === undefined) {
    return { ...common, content: "", cardSlot };
  }

  return {
    ...common,
    content: () => (
      // One line tall, so the bar centers on the first line of neighboring text cells.
      <div css={Css.df.aic.w100.h("1lh").$}>
        <ProgressBar value={value} aiMode={common.aiMode} />
      </div>
    ),
    value,
    sortValue: value,
    cardSlot: cardSlot ?? cardProgressSlot(value),
  };
}
