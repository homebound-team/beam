import { Css, Only, Palette, Xss } from "src/Css";
import { useTestIds } from "src/utils";

type CountBadgeXss = "color";

export interface CountBadgeProps<X> {
  count: number;
  /** Background color of the badge. Defaults to Blue700. */
  bgColor?: Palette;
  xss?: X;
}

/**
 * CountBadge displays a numeric count in a circular badge.
 * Automatically adjusts size for counts > 100 (increases from 16px to 18px).
 */
export function CountBadge<X extends Only<Xss<CountBadgeXss>, X>>(props: CountBadgeProps<X>) {
  const { count, bgColor = Palette.Blue700, xss, ...otherProps } = props;
  const tid = useTestIds(otherProps, "countBadge");

  // Use larger size for counts > 100
  const size = count > 100 ? 18 : 16;
  const sizeStyles = size === 18 ? Css.wPx(18).hPx(18).$ : Css.wPx(16).hPx(16).$;

  return (
    <span
      {...tid}
      css={{
        ...sizeStyles,
        ...Css.fs0.br100.white.xs2Sb.df.aic.jcc.bgColor(bgColor).$,
        ...xss,
      }}
    >
      {count}
    </span>
  );
}
