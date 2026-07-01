import type { ReactNode } from "react";
import type { IconKey } from "src/components";
import type { CardTag } from "src/components/Card";
import type { TagType } from "src/components/Tag";

type CardSlotBase<K extends string> = { kind: K };

/** Tag props for badge slots — mirrors Tag (type, icon, iconOnly) with string-only text. */
export type CardBadgeTag = {
  text: string;
  type?: TagType;
} & ({ iconOnly?: false; icon?: IconKey } | { iconOnly: true; icon: IconKey });

export type CardTitleSlot = CardSlotBase<"title"> & { text: string };
export type CardEyebrowSlot = CardSlotBase<"eyebrow"> & { text: string };
export type CardBadgeSlot = CardSlotBase<"badge"> & { text: string; tags?: CardBadgeTag[] };
export type CardStatusSlot = CardSlotBase<"status"> & { tag: CardTag };
export type CardDataBlockSlot = CardSlotBase<"dataBlock"> & { label: string; value: ReactNode | string | number };
export type CardProgressSlot = CardSlotBase<"progress"> & { value: number };

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

export function cardBadgeSlot(text: string, tags?: CardBadgeTag[]): CardBadgeSlot {
  return { kind: "badge", text, tags };
}

export function cardStatusSlot(tag: CardTag): CardStatusSlot {
  return { kind: "status", tag };
}

export function cardDataBlockSlot(props: { label: string; value: ReactNode | string | number }): CardDataBlockSlot {
  return { kind: "dataBlock", ...props };
}

export function cardProgressSlot(value: number): CardProgressSlot {
  return { kind: "progress", value };
}
