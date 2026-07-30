import { Css } from "src/Css";
import { Value } from "src/inputs";
import { SelectCardLayout, SelectCardView } from "src/inputs/SelectCard/types";

type SelectCardGroupOptionLike<V extends Value> = {
  value: V;
  selectionBehavior?: "exclusive";
};

export type GetNextSelectCardGroupValuesArgs<V extends Value> = {
  currentValues: V[];
  clickedValue: V;
  options: SelectCardGroupOptionLike<V>[];
};

/** Next selection after a click, applying `selectionBehavior: "exclusive"` (clears others / cannot combine). */
export function getNextSelectCardGroupValues<V extends Value>({
  currentValues,
  clickedValue,
  options,
}: GetNextSelectCardGroupValuesArgs<V>): V[] {
  const option = options.find((o) => o.value === clickedValue);
  if (!option) return currentValues;

  if (currentValues.includes(clickedValue)) {
    return currentValues.filter((v) => v !== clickedValue);
  }

  const isExclusive = option.selectionBehavior === "exclusive";
  if (isExclusive) {
    return [clickedValue];
  }

  const exclusiveValues = new Set(options.filter((o) => o.selectionBehavior === "exclusive").map((o) => o.value));
  return [...currentValues.filter((v) => !exclusiveValues.has(v)), clickedValue];
}

/** Which option was checked or unchecked between two selection snapshots (one change per click). */
export function findToggledSelectCardGroupValue<V extends Value>(prev: V[], next: V[]): V | undefined {
  const added = next.find((v) => !prev.includes(v));
  if (added !== undefined) return added;
  return prev.find((v) => !next.includes(v));
}

type GetSelectCardOptionsCssArgs = {
  view: SelectCardView;
  hasDescription?: boolean;
  layout?: SelectCardLayout;
  hasImage?: boolean;
};

export function getSelectCardOptionsCss({ view, hasDescription, layout, hasImage }: GetSelectCardOptionsCssArgs) {
  if (view === "list") return Css.df.fdc.gap2.w100.$;
  // Horizontal cards fit the icon and text side-by-side, so they need a wider column.
  const cardWidth = layout === "horizontal" ? 240 : hasImage || hasDescription ? 192 : 142;
  return Css.dg.gtc(`repeat(auto-fill, minmax(${cardWidth}px, 1fr))`).gap2.$;
}
