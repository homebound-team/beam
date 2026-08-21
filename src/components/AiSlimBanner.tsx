import { Button } from "src/components/Button";
import { Icon } from "src/components/Icon";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type AiSlimBannerProps = {
  title: string;
  action?: ActionButtonProps;
};

/**
 * A slim AI notice, for sitting inline above the content it's about.
 */
export function AiSlimBanner(props: AiSlimBannerProps) {
  const { title, action } = props;
  const tid = useTestIds(props, "aiSlimBanner");
  return (
    <div css={Css.df.ais.gap2.w100.px2.xs.aiBackground.$} {...tid}>
      {/* Matches the title's first line box (16px line height plus its 8px above and below) so the star
          stays on that line rather than drifting to the middle of wrapped copy. */}
      <span css={Css.df.aic.fs0.py1.hPx(32).$}>
        <Icon icon="aiStar" inc={1.5} />
      </span>
      <div css={Css.df.aic.jcsb.gap2.fg1.mw0.$}>
        {/* The vertical padding lives on the title so an action's taller line box can't grow the bar. */}
        <span css={Css.xsSb.aiBoldText.py1.mw0.$} {...tid.title}>
          {title}
        </span>
        {action && (
          <div css={Css.fs0.$}>
            <Button {...action} variant="text" />
          </div>
        )}
      </div>
    </div>
  );
}
