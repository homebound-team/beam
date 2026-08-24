import { Icon } from "src/components/Icon";
import { Css, increment, Margin, Only, Tokens, Xss } from "src/Css";
import { useTestIds } from "src/utils";

export type AiTagIconXss = Margin | "flexShrink";

export type AiTagIconProps<X> = {
  /** The size of the tag, default is 2 == 16px. */
  inc?: number;
  /** Styles overrides */
  xss?: X;
};

/**
 * The AI sparkle on a circular background, for marking content that AI has touched.
 */
export function AiTagIcon<X extends Only<Xss<AiTagIconXss>, X>>(props: AiTagIconProps<X>) {
  const { inc = 2, xss, ...otherProps } = props;
  const tid = useTestIds(otherProps, "aiTagIcon");
  return (
    <span
      {...tid}
      css={{
        ...Css.dif.aic.jcc.fs0.br100.sqPx(increment(inc)).bgColor(Tokens.AiFieldBg).$,
        ...xss,
      }}
    >
      {/* Design insets the sparkle by a quarter of the tag on each side, so it always draws at half the tag's size. */}
      <Icon icon="aiStar" inc={inc / 2} />
    </span>
  );
}
