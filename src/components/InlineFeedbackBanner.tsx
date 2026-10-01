import type { ReactNode } from "react";
import type { BeamColor } from "src/colors";
import { Button } from "src/components/Button";
import { ButtonMenu, type ButtonMenuProps } from "src/components/ButtonMenu";
import type { IconKey } from "src/components/Icon";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { Tag, type TagProps, type TagType, type TagVariant } from "src/components/Tag";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type InlineFeedbackBannerType = "error" | "warning";

/** A banner action: a text `Button`, or a `menu` that opens a `ButtonMenu` from a text trigger. */
export type InlineFeedbackBannerAction =
  ActionButtonProps | ({ kind: "menu"; label: string } & Pick<ButtonMenuProps, "items" | "disabled" | "tooltip">);

export type InlineFeedbackBannerProps = {
  type: InlineFeedbackBannerType;
  tagText?: TagProps<any>["text"];
  tagVariant?: TagVariant;
  description: ReactNode;
  /** Rendered in order, always as text buttons (menu triggers included). */
  actions?: InlineFeedbackBannerAction[];
};

/**
 * A tagged error/warning notice that sits inline with the content it's about.
 *
 * Any background behind the banner belongs to whatever is hosting it.
 */
export function InlineFeedbackBanner(props: InlineFeedbackBannerProps) {
  const { type, tagText, tagVariant, description, actions = [] } = props;
  const { icon, tagType, borderColor, fallbackTagText } = typeStyles[type];
  const tid = useTestIds(props, "inlineFeedbackBanner");
  // Split rather than an `iconOnly={!tagText}` because Tag's `text` changes job between the two:
  // visible copy when labeled, tooltip and screen-reader label when `iconOnly`.
  const tagProps: TagProps<never> = tagText
    ? { type: tagType, variant: tagVariant, icon, text: tagText }
    : { type: tagType, variant: tagVariant, icon, text: fallbackTagText, iconOnly: true };

  return (
    <div css={Css.df.ais.w100.p1.br4.xs.bgColor(Tokens.Surface).ba.bc(borderColor).boxShadow(bannerShadow).$} {...tid}>
      <span css={Css.df.aic.hPx(24).fs0.$}>
        <Tag {...tagProps} {...tid.tag} />
      </span>
      <span css={Css.fg1.mw0.mlPx(4).pyPx(4).color(Tokens.OnSurface).$} {...tid.description}>
        {description}
      </span>
      {actions.length > 0 && (
        <div css={Css.df.aic.hPx(24).gap2.mlPx(20).fs0.$}>
          {actions.map((action) =>
            "kind" in action ? (
              <ButtonMenu
                key={action.label}
                trigger={{ label: action.label, variant: "text" }}
                items={action.items}
                disabled={action.disabled}
                tooltip={action.tooltip}
              />
            ) : (
              <Button key={`${action.label}`} {...action} variant="text" />
            ),
          )}
        </div>
      )}
    </div>
  );
}

// Design's banner shadow, lighter than `bshBasic`. Intentionally unique to this component.
const bannerShadow = "0px 2px 4px rgba(53, 53, 53, 0.08)";

type TypeStyle = { icon: IconKey; tagType: TagType; borderColor: BeamColor; fallbackTagText: string };

const typeStyles: Record<InlineFeedbackBannerType, TypeStyle> = {
  error: { icon: "xCircle", tagType: "error", borderColor: Tokens.Danger, fallbackTagText: "Error" },
  // Warning has no semantic border token
  warning: { icon: "error", tagType: "warning", borderColor: Palette.Orange700, fallbackTagText: "Warning" },
};
