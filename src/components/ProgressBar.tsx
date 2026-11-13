import { useMemo } from "react";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type ProgressBarProps = {
  /** A number between 0 and 100. Values outside this range are clamped. */
  value: number;
  /** Paints the track for the AI surface. */
  aiMode?: boolean;
};

/**
 * A horizontal bar showing `value` as a percentage, with the percentage as a label beside it.
 *
 * Fills its container's width; wrap it to control the length.
 */
export function ProgressBar(props: ProgressBarProps) {
  const { value, aiMode = false } = props;
  const tid = useTestIds(props, "progressBar");
  const progressValue = useMemo(() => clampProgress(value), [value]);

  return (
    <div css={Css.df.aic.gap1.w100.xs2.$} {...tid}>
      {/* `SurfaceSubtle` is Gray200, which all but vanishes on the AI fill. `oh` clips the fill to the
          track's rounded corners, so the fill's leading edge stays square until it reaches 100%. */}
      <div css={Css.fg1.hPx(8).br4.oh.bgColor(aiMode ? Palette.Purple200 : Tokens.SurfaceSubtle).$} {...tid.track}>
        <div css={Css.h100.bgBlue500.w(`${progressValue}%`).$} {...tid.fill} />
      </div>
      {/* A fixed-width label keeps every track the same length, so stacked bars line up.
          `5ch` fits the widest label, "100%". Flooring keeps it there, and avoids showing 100% early. */}
      <span css={Css.fs0.mw("5ch").$} {...tid.value}>
        {Math.floor(progressValue)}%
      </span>
    </div>
  );
}

function clampProgress(value: number): number {
  if (process.env.NODE_ENV !== "production" && (value < 0 || value > 100)) {
    console.warn(`[ProgressBar] value ${value} is outside the expected range [0, 100] and will be clamped.`);
  }
  return Math.min(100, Math.max(0, value));
}
