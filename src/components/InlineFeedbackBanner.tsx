import { ReactNode } from "react";
import { BeamColor } from "src/colors";
import { Button } from "src/components/Button";
import { IconKey } from "src/components/Icon";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { Tag, TagProps, TagType } from "src/components/Tag";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type InlineFeedbackBannerType = "error" | "warning";

export type InlineFeedbackBannerProps = {
  type: InlineFeedbackBannerType;
  tagText?: TagProps<any>["text"];
  description: ReactNode;
  /** Rendered in order, always as text buttons. */
  actions?: ActionButtonProps[];
};

/**
 * A tagged error/warning notice that sits inline with the content it's about.
 *
 * Any background behind the banner belongs to whatever is hosting it.
 */
export function InlineFeedbackBanner(props: InlineFeedbackBannerProps) {
  const { type, tagText, description, actions = [] } = props;
  const { icon, tagType, borderColor, fallbackTagText } = typeStyles[type];
  const tid = useTestIds(props, "inlineFeedbackBanner");
  // Split rather than an `iconOnly={!tagText}` because Tag's `text` changes job between the two:
  // visible copy when labeled, tooltip and screen-reader label when `iconOnly`.
  const tagProps: TagProps<never> = tagText
    ? { type: tagType, icon, text: tagText }
    : { type: tagType, icon, text: fallbackTagText, iconOnly: true };

  return (
    <div css={Css.df.ais.gap1.w100.p1.br4.xs.bgColor(Tokens.Surface).ba.bc(borderColor).bshBasic.$} {...tid}>
      {/* `df` so Tag's inline-flex box doesn't pick up a line box's descender space. */}
      <span css={Css.df.fs0.$}>
        <Tag {...tagProps} {...tid.tag} />
      </span>
      <span css={Css.fg1.mw0.color(Tokens.OnSurface).$} {...tid.description}>
        {description}
      </span>
      {actions.length > 0 && (
        // Held to the tag's height so a text button's taller line box can't grow the banner.
        <div css={Css.df.aic.gap(1.5).fs0.hPx(18).$}>
          {actions.map((action) => (
            <Button key={`${action.label}`} {...action} variant="text" />
          ))}
        </div>
      )}
    </div>
  );
}

type TypeStyle = { icon: IconKey; tagType: TagType; borderColor: BeamColor; fallbackTagText: string };

const typeStyles: Record<InlineFeedbackBannerType, TypeStyle> = {
  error: { icon: "xCircle", tagType: "error", borderColor: Tokens.Danger, fallbackTagText: "Error" },
  // Warning has no semantic border token
  warning: { icon: "error", tagType: "warning", borderColor: Palette.Orange700, fallbackTagText: "Warning" },
};
