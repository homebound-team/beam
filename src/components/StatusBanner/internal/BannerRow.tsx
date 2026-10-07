import type { ReactNode } from "react";
import type { ButtonVariant } from "src/components/Button";
import { Icon } from "src/components/Icon";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { BannerActions } from "src/components/StatusBanner/internal/BannerActions";
import { bannerTypeStyles } from "src/components/StatusBanner/internal/bannerTypeStyles";
import type { PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type BannerRowProps = PageBannerProps & {
  /** Chevron that opens the item rows. Set by the accordion. */
  accordionToggle?: ReactNode;
};

/** Icon, copy, and actions shared by every banner chrome. */
export function BannerRow(props: BannerRowProps) {
  const { type, icon, title, description, primaryAction, secondaryAction, accordionToggle } = props;
  const tid = useTestIds(props, "banner");
  const { iconColor, defaultIcon } = bannerTypeStyles[type];
  const actions = [
    secondaryAction && { action: secondaryAction, variant: "secondary" as ButtonVariant },
    primaryAction && { action: primaryAction, variant: "primary" as ButtonVariant },
  ].filter((a): a is { action: ActionButtonProps; variant: ButtonVariant } => !!a);

  return (
    // Actions wrap below the copy once the row is tight. On small screens they take their own row.
    <div css={Css.df.aic.gap2.fww.w100.gray900.ifSm.aifs.$}>
      {/* `fb(0)` so the copy shares the row until it hits its min width, rather than wrapping early. */}
      <div css={Css.df.aifs.gap1.fg1.fb(0).mwPx(240).ifSm.mw0.$}>
        <span css={Css.fs0.df.$}>
          <Icon icon={icon ?? defaultIcon} color={iconColor} {...tid.icon} />
        </span>
        <div css={Css.df.fdc.gap1.mw0.$}>
          <span css={Css.mdSb.$} {...tid.title}>
            {title}
          </span>
          {description && (
            <span css={Css.sm.$} {...tid.description}>
              {description}
            </span>
          )}
        </div>
      </div>
      {/* gap1 between the actions and the chevron. On small screens the box drops out so those children wrap in the row. */}
      <div css={Css.df.aic.gap1.ifSm.display("contents").$}>
        {actions.length > 0 && <BannerActions actions={actions} />}
        {accordionToggle && <span css={Css.fs0.df.ifSm.add("order", "2").$}>{accordionToggle}</span>}
      </div>
    </div>
  );
}
