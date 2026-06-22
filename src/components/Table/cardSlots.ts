import type { ReactNode } from "react";
import type { CardTag } from "src/components/Card";

type CardSlotBase<K extends string> = { kind: K };

export type CardTitleSlot = CardSlotBase<"title"> & { text: string };
export type CardEyebrowSlot = CardSlotBase<"eyebrow"> & { text: string };
export type CardBadgeSlot = CardSlotBase<"badge"> & { text: string };
export type CardStatusSlot = CardSlotBase<"status"> & { tag: CardTag };
export type CardDataBlockSlot = CardSlotBase<"dataBlock"> & { label: string; value: ReactNode | string | number };
export type CardProgressSlot = CardSlotBase<"progress"> & { label: string; value: number };

export type CardSlot =
  | CardTitleSlot
  | CardEyebrowSlot
  | CardBadgeSlot
  | CardStatusSlot
  | CardDataBlockSlot
  | CardProgressSlot;

export function cardTitleSlot(text: string): CardTitleSlot {
  return { kind: "title", text };
}

export function cardEyebrowSlot(text: string): CardEyebrowSlot {
  return { kind: "eyebrow", text };
}

export function cardBadgeSlot(text: string): CardBadgeSlot {
  return { kind: "badge", text };
}

export function cardStatusSlot(tag: CardTag): CardStatusSlot {
  return { kind: "status", tag };
}

export function cardDataBlockSlot(props: { label: string; value: ReactNode | string | number }): CardDataBlockSlot {
  return { kind: "dataBlock", ...props };
}

export function cardProgressSlot(props: { label: string; value: number }): CardProgressSlot {
  return { kind: "progress", ...props };
}
