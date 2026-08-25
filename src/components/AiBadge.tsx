import { Icon } from "src/components/Icon";
import { Css, increment, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AiBadgeProps = {
  /** The size of the badge, default is 2 == 16px. */
  inc?: number;
};

/**
 * The AI sparkle on a circular background, for marking content that AI has touched.
 */
export function AiBadge(props: AiBadgeProps) {
  const { inc = 2 } = props;
  const tid = useTestIds(props, "aiBadge");
  return (
    <span {...tid} css={Css.dif.aic.jcc.fs0.br100.sqPx(increment(inc)).bgColor(Tokens.AiFieldBg).$}>
      {/* Design insets the sparkle by a quarter of the badge on each side, so it always draws at half that size. */}
      <Icon icon="aiStar" inc={inc / 2} />
    </span>
  );
}
