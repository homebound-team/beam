import { Icon } from "src/components/Icon";
import { Css, increment, Margin, Only, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type AiLoaderProps<X> = {
  inc?: number;
  /** Accessible name for the indicator, defaults to "Loading". */
  label?: string;
  /** Styles overrides */
  xss?: X;
};

/** An indeterminate loading indicator for AI-driven work. */
export function AiLoader<X extends Only<Xss<Margin>, X>>(props: AiLoaderProps<X>) {
  const { inc = 3, label = "Loading", xss } = props;
  const tid = useTestIds(props, "aiLoader");
  // Each star keeps a full-size slot and only scales within it, so a swelling star never nudges
  // its neighbors sideways. This gap leaves the design's 16px between two resting stars.
  const gap = increment(inc) / 6;

  return (
    <div role="img" aria-label={label} css={{ ...Css.df.aic.jcc.fs0.gapPx(gap).pxPx(gap).$, ...xss }} {...tid}>
      {[0, 1, 2].map((i) => (
        <span key={i} css={starStyles(i)} {...tid[`star${i + 1}`]}>
          <Icon icon="aiStar" inc={inc} />
        </span>
      ))}
    </div>
  );
}

const cycleMs = 1500;

function starStyles(index: number) {
  return (
    Css.df
      // Also the keyframes' 0%, so stars waiting out their delay (and reduced-motion users) rest small.
      .add("transform", "scale(0.5)")
      .add("animationName", "aiStarLoader")
      .add("animationDuration", `${cycleMs}ms`)
      .add("animationIterationCount", "infinite")
      .add("animationTimingFunction", "ease-in-out")
      .add("animationDelay", `${(index * cycleMs) / 3}ms`).$
  );
}
