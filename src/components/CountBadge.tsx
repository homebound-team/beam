import { BeamColor } from "src/colors";
import { Badge } from "src/components/internal/Badge";
import { Only, Palette, Xss } from "src/Css";
import { useTestIds } from "src/utils";

type CountBadgeXss = "color";

export type CountBadgeProps<X> = {
  count: number;
  /** Background color of the badge. Defaults to Blue700. */
  bgColor?: BeamColor;
  color?: BeamColor;
  hideIfZero?: boolean;
};

/**
 * CountBadge displays a numeric count in a circular badge.
 * Automatically adjusts size for counts > 100 (increases from 16px to 18px).
 */
export function CountBadge<X extends Only<Xss<CountBadgeXss>, X>>(props: CountBadgeProps<X>) {
  const { count, bgColor = Palette.Blue700, color = Palette.White, hideIfZero = false, ...otherProps } = props;
  const tid = useTestIds(otherProps, "countBadge");

  if (hideIfZero && count === 0) return null;

  // Use larger size for counts > 100
  return (
    <Badge {...tid} color={bgColor} textColor={color} sizePx={count > 100 ? 18 : 16}>
      {count}
    </Badge>
  );
}
