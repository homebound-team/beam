import { useId } from "react";
import { Css, increment, Margin, Palette, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type AiLoaderProps = {
  inc?: number;
  /** Accessible name for the indicator, defaults to "Loading". */
  label?: string;
  /** Styles overrides */
  xss?: Xss<Margin>;
};

/** An indeterminate loading indicator for AI-driven work. */
export function AiLoader(props: AiLoaderProps) {
  const { inc = 3, label = "Loading", xss } = props;
  const tid = useTestIds(props, "aiLoader");
  const size = increment(inc);
  // Namespace the gradient so multiple loaders on a page don't collide; `useId` includes colons.
  const gradientId = `aiLoaderGradient-${useId().replaceAll(":", "")}`;

  return (
    <svg
      role="img"
      aria-label={label}
      width={(rowWidth * size) / starSize}
      height={size}
      viewBox={`0 0 ${rowWidth} ${starSize}`}
      xmlns="http://www.w3.org/2000/svg"
      css={{ ...Css.fs0.$, ...xss }}
      {...tid}
    >
      <defs>
        {/* Diagonal blue-to-purple sweep, in the star's own user space so it scales with the glyph. */}
        <linearGradient id={gradientId} x1="24" y1="24" x2="11.1944" y2="26.1689" gradientUnits="userSpaceOnUse">
          <stop stopColor={Palette.Blue700} />
          <stop offset="1" stopColor={Palette.Purple700} />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${starGap + i * (starSize + starGap)}, 0)`}>
          <path d={starPath} fill={`url(#${gradientId})`} css={starStyles(i)} {...tid[`star${i + 1}`]} />
        </g>
      ))}
    </svg>
  );
}

/**
 * Geometry in the design's 24px-star units; `inc` scales the whole row via the viewBox.
 *
 * Each star gets a fixed `starSize` slot and only ever scales within it, so growing stars never
 * nudge their neighbors sideways. At rest the halved glyphs sit `starSize / 2 + starGap` apart,
 * which is the 16px gap the design draws between two small stars.
 */
const starSize = 24;
const starGap = 4;
const rowWidth = starSize * 3 + starGap * 4;

const cycleMs = 1500;

function starStyles(index: number) {
  return (
    Css.add("transformBox", "fill-box")
      .add("transformOrigin", "center")
      // Also the keyframes' 0%, so stars waiting out their delay (and reduced-motion users) rest small.
      .add("transform", "scale(0.5)")
      .add("animationName", "aiStarLoader")
      .add("animationDuration", `${cycleMs}ms`)
      .add("animationIterationCount", "infinite")
      .add("animationTimingFunction", "ease-in-out")
      .add("animationDelay", `${(index * cycleMs) / 3}ms`).$
  );
}

/** Eight-pointed sparkle, drawn to fill a 24x24 box. */
const starPath =
  "M12.9626 9.3548L19.4693 2.84806C19.8571 2.4603 20.4861 2.46022 20.8739 2.84806L20.9418 2.92322C21.2598 3.31316 21.2377 3.88891 20.8739 4.25269L14.0892 11.0374H23.0067C23.5552 11.0374 24 11.4822 24 12.0307C23.9999 12.5789 23.5553 13.024 23.0067 13.024H14.5159L20.6307 19.1387L20.6994 19.2147C20.9953 19.5785 20.9952 20.1029 20.6994 20.4666L20.6307 20.5426C20.2428 20.9304 19.6139 20.9304 19.226 20.5426L12.9626 14.2791V23.0067C12.9626 23.5552 12.5178 24 11.9693 24C11.4211 23.9999 10.976 23.5553 10.976 23.0067V14.1498L4.618 20.5078C4.25431 20.8715 3.67862 20.8941 3.28852 20.5757L3.21336 20.5078C2.82588 20.12 2.82584 19.4918 3.21336 19.104L9.29337 13.024H0.993265C0.47908 13.024 0.0559128 12.633 0.00484914 12.1325L0 12.0307C0 11.4822 0.444789 11.0374 0.993265 11.0374H9.7201L2.9701 4.28745C2.58225 3.89959 2.58241 3.2706 2.9701 2.88281L3.04526 2.81492C3.43535 2.49653 4.01105 2.51913 4.37473 2.88281L10.976 9.48411V0.993265C10.976 0.444731 11.4211 0.000149661 11.9693 0C12.5178 2.4664e-08 12.9626 0.444789 12.9626 0.993265V9.3548Z";
