import { useId } from "react";
import { aiStarPath } from "src/components/Icon";
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
          <path d={aiStarPath} fill={`url(#${gradientId})`} css={starStyles(i)} {...tid[`star${i + 1}`]} />
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
