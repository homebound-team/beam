import { ReactNode } from "react";
import { BeamColor } from "src/colors";
import { Button } from "src/components/Button";
import { Icon, IconKey } from "src/components/Icon";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type RowBannerType = "error" | "warning";

export type RowBannerProps = {
  type: RowBannerType;
  description: ReactNode;
  /** Rendered in order, always as text buttons. */
  actions?: ActionButtonProps[];
};

/**
 * An error/warning notice for a `GridTable` row's `companion` slot.
 *
 * Any bgColor behind the banner belongs to the row, not to the banner.
 */
export function RowBanner(props: RowBannerProps) {
  const { type, description, actions = [] } = props;
  const { icon, color, bgColor } = typeStyles[type];
  const tid = useTestIds(props, "rowBanner");
  return (
    <div css={Css.df.ais.gap(0.5).w100.p1.br4.xs.bgColor(Tokens.Surface).ba.bc(color).bshBasic.$} {...tid}>
      {/* Matches the copy's 16px line box, so the taller icon centers on the first line rather than
          drifting to the middle of wrapped copy — and overflows the line instead of growing it. */}
      <span css={Css.df.aic.fs0.h2.$}>
        {/* Padding and icon spacing is slightly different than our default icon atm */}
        <span css={Css.df.aic.jcc.fs0.hPx(18).wPx(18).br4.bgColor(bgColor).$}>
          <Icon icon={icon} inc={1.75} color={color} {...tid.type} />
        </span>
      </span>
      <span css={Css.fg1.mw0.color(Tokens.OnSurface).$} {...tid.description}>
        {description}
      </span>
      {actions.length > 0 && (
        // Pinned to the same line box so a text button's taller one can't grow the banner either.
        <div css={Css.df.aic.gap(1.5).fs0.h2.$}>
          {actions.map((action) => (
            <Button key={`${action.label}`} {...action} variant="text" />
          ))}
        </div>
      )}
    </div>
  );
}

const typeStyles: Record<RowBannerType, { icon: IconKey; color: BeamColor; bgColor: BeamColor }> = {
  error: { icon: "xCircle", color: Tokens.Danger, bgColor: Palette.Red100 },
  warning: { icon: "error", color: Palette.Orange700, bgColor: Palette.Orange100 },
};
