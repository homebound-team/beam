import { ReactNode } from "react";
import { BeamColor } from "src/colors";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";

export type BadgeProps = {
  /** Circle background color. Defaults to Blue700. */
  color?: BeamColor;
  /** Content color (e.g. the count text). Defaults to White. */
  textColor?: BeamColor;
  /** Diameter in px. Defaults to 16. */
  sizePx?: number;
  children?: ReactNode;
};

/**
 * Internal base badge: a small colored circle, optionally containing content (e.g. a count).
 *
 * `CountBadge` builds on this (always with a count); `Icon` uses it directly for the
 * no-count "dot" variant. Not part of the public package API.
 */
export function Badge(props: BadgeProps) {
  const { color = Palette.Blue700, textColor = Palette.White, sizePx = 16, children, ...others } = props;
  // Defaults to "badge"; callers (e.g. CountBadge) can override by passing their own test id.
  const tid = useTestIds(others, "badge");
  return (
    <span {...tid} css={Css.sqPx(sizePx).fs0.br100.xs2Sb.df.aic.jcc.bgColor(color).color(textColor).$}>
      {children}
    </span>
  );
}
