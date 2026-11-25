import { Icon } from "src/components/Icon";
import { usePresentationContext } from "src/components/PresentationContext";
import type { GridCellContent } from "src/components/Table/components/cell";
import { Css, Palette } from "src/Css";
import { getNumberFormatOptions } from "src/inputs/NumberField";

/** A change to show next to a cell's number, e.g. compared with the last revision. */
export type CellDelta = {
  value: number;
  /**
   * Whether an increase is good (green) or bad (red). A decrease gets the other color.
   * @default "good"
   */
  increaseIs?: "good" | "bad";
};

export type NumberCellOpts = Pick<GridCellContent, "tooltip" | "sticky" | "colspan" | "css" | "aiMode" | "cardSlot"> & {
  /** Shows an arrow and the signed change after the number. Hidden when it's `0`. */
  delta?: CellDelta;
};

// Same options as a plain `NumberField`. Builders run outside React, so these use the runtime's default locale.
const formatter = new Intl.NumberFormat(undefined, getNumberFormatOptions({}));
const deltaFormatter = new Intl.NumberFormat(undefined, getNumberFormatOptions({ displayDirection: true }));

/**
 * Builds a body cell for a plain number, formatted the same way as `NumberField` (i.e. `1,234.5`).
 *
 * - Left-aligned; money and percentages are the right-aligned cells.
 * - Flexible rows wrap the text; fixed rows truncate it to one line.
 * - `null`, `undefined` and `NaN` render the table's `emptyCell` ("-"), and hide the delta.
 * - `value` (filtering and CSV) is the formatted text, and `sortValue` is the number, so sorting is numeric. The delta is never sorted on.
 */
export function numberCell(value: number | null | undefined, opts: NumberCellOpts = {}): GridCellContent {
  const { delta, ...common } = opts;

  if (value === null || value === undefined || Number.isNaN(value)) {
    return { ...common, content: "" };
  }

  const text = formatter.format(value);
  const showDelta = !!delta && delta.value !== 0 && !Number.isNaN(delta.value);
  return {
    ...common,
    // Plain text gets the table's own truncate/wrap handling, so only build JSX when there's a delta.
    content: showDelta ? () => <NumberWithDelta text={text} delta={delta} /> : text,
    value: text,
    sortValue: value,
  };
}

/**
 * Fixed rows keep the delta inline and truncate the number.
 *
 * Flexible rows drop the delta onto the next line when both don't fit, since numbers have no break points and would
 * otherwise overflow under the delta. A number wider than the whole column breaks mid-number as a last resort.
 */
function NumberWithDelta({ text, delta }: { text: string; delta: CellDelta }) {
  const { wrap } = usePresentationContext();
  const fixed = wrap === false;
  const { value, increaseIs = "good" } = delta;
  const isIncrease = value > 0;
  const isGood = isIncrease === (increaseIs === "good");

  return (
    <span css={Css.df.cg1.mw0.maxw100.if(!fixed).fww.$}>
      <span css={Css.mw0.if(fixed).truncate.else.add("overflowWrap", "anywhere").$} title={fixed ? text : undefined}>
        {text}
      </span>
      <span css={Css.df.aic.gapPx(2).fs0.color(isGood ? Palette.Green700 : Palette.Red600).$}>
        <Icon icon={isIncrease ? "arrowUp" : "arrowDown"} inc={2} />
        {deltaFormatter.format(value)}
      </span>
    </span>
  );
}
