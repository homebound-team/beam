import { ReactNode, useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "src/components/Breadcrumbs";
import { PageHeaderProps } from "src/components/PageHeader";
import { TabsContentXss } from "src/components/Tabs";
import { Css, Only, Tokens } from "src/Css";
import { zIndices } from "src/utils/zIndices";

/**
 * SPIKE (DS-154) — Option 3 (extra idea, not one of the two you named).
 *
 * The header is always `position: sticky; top: 0` and never swaps between two discrete
 * layouts. Instead, a `progress` value (0-1) drives a continuous "collapsing toolbar"
 * interpolation of title font size and header padding.
 *
 * `progress` is a delta-accumulated scroll budget, not a readout of absolute `scrollY`:
 * each scroll event nudges it by `dy / COLLAPSE_SCROLL_BUDGET`, clamped to [0, 1]. That
 * makes scrolling up always un-shrink the header proportionally to how far up you scroll,
 * from anywhere on the page — matching how Options 1 and 2 (and today's production
 * behavior) reveal the full header on any upward scroll, not just once you're back near
 * the top. A pure `scrollY / distance` ratio would only start reversing once you'd
 * scrolled back under that absolute distance.
 *
 * Can't reuse `PageHeader` as-is here since it has no notion of a continuous scale — this
 * option builds its own rough title/breadcrumbs/rightSlot row instead. Self-contained and
 * throwaway, for design review only.
 *
 * The sticky header's own padding (hence height) changes continuously as `progress`
 * changes, which can trip the browser's scroll-anchoring compensation the same way it did
 * in Option 2 (see that file's comment for the full explanation) — small per-tick here so
 * it wasn't visibly broken, but disabling anchoring at the document root is the correct
 * fix regardless of magnitude.
 */
const COLLAPSE_SCROLL_BUDGET = 120;

// Interpolation endpoints, expanded -> collapsed (values pulled from Css's `xl`/`sm` type scale).
const TITLE_FONT_SIZE = [20, 14] as const;
const TITLE_LINE_HEIGHT = [28, 20] as const;
const HEADER_PADDING_Y = [24, 8] as const;

function lerp([from, to]: readonly [number, number], ratio: number): number {
  return from + (to - from) * ratio;
}

export type Option3ProgressiveShrinkProps<V extends string, X> = {
  pageHeader: PageHeaderProps<V, X>;
  /**
   * Fades rightSlot out as the header collapses (fully gone once `progress` reaches 1),
   * rather than a hard cutoff — there's no discrete "scrolled state" here to snap it away
   * at, so this folds the hide into the same continuous interpolation as everything else.
   */
  hideRightSlotOnScroll?: boolean;
  children?: ReactNode;
};

export function Option3ProgressiveShrink<V extends string, X extends Only<TabsContentXss, X>>(
  props: Option3ProgressiveShrinkProps<V, X>,
) {
  const { pageHeader, hideRightSlotOnScroll, children } = props;
  const { title, breadcrumbs, rightSlot } = pageHeader;
  const [progress, setProgress] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const prevOverflowAnchor = document.documentElement.style.overflowAnchor;
    document.documentElement.style.overflowAnchor = "none";
    return () => {
      document.documentElement.style.overflowAnchor = prevOverflowAnchor;
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const dy = y - lastScrollY.current;
      lastScrollY.current = y;

      if (y <= 0) {
        setProgress(0);
        return;
      }
      setProgress((prev) => Math.min(1, Math.max(0, prev + dy / COLLAPSE_SCROLL_BUDGET)));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div css={Css.df.fdc.w100.$}>
      <div
        css={Css.sticky.top0.z(zIndices.pageStickyHeader).bgColor(Tokens.Surface).bb.bc(Tokens.SurfaceSeparator).$}
        style={{
          paddingTop: lerp(HEADER_PADDING_Y, progress),
          paddingBottom: lerp(HEADER_PADDING_Y, progress),
        }}
      >
        <div css={Css.df.jcsb.aic.gap2.px3.$}>
          <div css={Css.mw0.$}>
            {breadcrumbs && <Breadcrumbs {...breadcrumbs} />}
            <h1
              css={Css.mw0.truncate.$}
              style={{
                fontSize: lerp(TITLE_FONT_SIZE, progress),
                lineHeight: `${lerp(TITLE_LINE_HEIGHT, progress)}px`,
                fontWeight: 600,
              }}
            >
              {title}
            </h1>
          </div>
          <div css={Css.fs0.$} style={hideRightSlotOnScroll ? { opacity: 1 - progress } : undefined}>
            {rightSlot}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
