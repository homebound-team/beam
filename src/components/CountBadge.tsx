import { Css, Only, Palette, Xss } from "src/Css";
import { useTestIds } from "src/utils";

type CountBadgeXss = "color";

export interface CountBadgeProps<X> {
  count: number;
  /** Background color of the badge. Defaults to Blue700. */
  bgColor?: Palette;
  color?: Palette;
  hideIfZero?: boolean;
}

/**
 * CountBadge displays a numeric count in a circular badge.
 * Automatically adjusts size for counts > 100 (increases from 16px to 18px).
 */
export function CountBadge<X extends Only<Xss<CountBadgeXss>, X>>(props: CountBadgeProps<X>) {
  const { count, bgColor = Palette.Blue700, color = Palette.White, hideIfZero = false, ...otherProps } = props;
  const tid = useTestIds(otherProps, "countBadge");

  if (hideIfZero && count === 0) return null;

  return (
    <span
      {...tid}
      css={{
        ...Css.sqPx(count > 100 ? 18 : 16).$, // Use larger size for counts > 100
        ...Css.fs0.br100.xs2Sb.df.aic.jcc.bgColor(bgColor).$,
        ...Css.color(color).$,
      }}
    >
      {count}
    </span>
  );
}
