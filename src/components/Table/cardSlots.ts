import type { ReactNode } from "react";
import type { IconKey } from "src/components";
import type { CardTag } from "src/components/Card";
import type { ProposedValueProps } from "src/components/ProposedValue";
import type { TagType } from "src/components/Tag";

type CardSlotBase<K extends string> = { kind: K };

/** Tag props for badge slots — mirrors Tag (type, icon, iconOnly) with string-only text. */
export type CardBadgeTag = {
  text: string;
  type?: TagType;
} & ({ iconOnly?: false; icon?: IconKey } | { iconOnly: true; icon: IconKey });

/** `text` is either plain, or a `ProposedValueProps` the card renders via `ProposedValue`. */
export type CardTitleSlot = CardSlotBase<"title"> & { text: string | ProposedValueProps };
/** Left meta text above the title. `text` is plain, or a `ProposedValueProps` rendered via `ProposedValue`. */
export type CardLeftEyebrowSlot = CardSlotBase<"leftEyebrow"> & { text: string | ProposedValueProps };
/** Right meta text above the title. Distinct from title-row `cardBadgeSlot`. Same `text` shape as left. */
export type CardRightEyebrowSlot = CardSlotBase<"rightEyebrow"> & { text: string | ProposedValueProps };
export type CardBadgeSlot = CardSlotBase<"badge"> & { text: string; tags?: CardBadgeTag[] };
export type CardStatusSlot = CardSlotBase<"status"> & { tag: CardTag };
export type CardDataBlockSlot = CardSlotBase<"dataBlock"> & { label: string; value: ReactNode | string | number };
export type CardProgressSlot = CardSlotBase<"progress"> & { value: number };

/** One thumbnail link in a carousel interactive footer. */
export type CardCarouselThumbnail = {
  id: string;
  imgUrl: string;
  label: string;
  to: string;
};

export type CardCarouselFooter = {
  kind: "carousel";
  title: string;
  thumbnails: CardCarouselThumbnail[];
};

/** Discriminated union of footers that sit outside the card's row action. Add new variants here. */
export type CardInteractiveFooter = CardCarouselFooter;

export type CardInteractiveFooterSlot = CardSlotBase<"interactiveFooter"> & {
  footer: CardInteractiveFooter;
};

/** @deprecated Prefer `cardLeftEyebrowSlot`. Alias kept for existing plan-code callers. */
export type CardEyebrowSlot = CardLeftEyebrowSlot;

export type CardSlot =
  | CardTitleSlot
  | CardLeftEyebrowSlot
  | CardRightEyebrowSlot
  | CardBadgeSlot
  | CardStatusSlot
  | CardDataBlockSlot
  | CardProgressSlot
  | CardInteractiveFooterSlot;

/** `text` stays a string for `alt` / `aria-label`, so a proposed title is declared rather than composed. */
export function cardTitleSlot(text: string | ProposedValueProps): CardTitleSlot {
  return { kind: "title", text };
}

export function cardLeftEyebrowSlot(text: string | ProposedValueProps): CardLeftEyebrowSlot {
  return { kind: "leftEyebrow", text };
}

export function cardRightEyebrowSlot(text: string | ProposedValueProps): CardRightEyebrowSlot {
  return { kind: "rightEyebrow", text };
}

/** @deprecated Prefer `cardLeftEyebrowSlot`. */
export function cardEyebrowSlot(text: string): CardLeftEyebrowSlot {
  return cardLeftEyebrowSlot(text);
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

/** Interactive footer that sits outside the card's row action. */
export function cardInteractiveFooterSlot(footer: CardInteractiveFooter): CardInteractiveFooterSlot {
  return { kind: "interactiveFooter", footer };
}

/** Convenience for the carousel interactive footer. */
export function cardCarouselSlot(props: {
  title: string;
  thumbnails: CardCarouselThumbnail[];
}): CardInteractiveFooterSlot {
  return cardInteractiveFooterSlot({ kind: "carousel", ...props });
}
