import { ReactNode, useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "src/components/Breadcrumbs";
import { PageHeader, PageHeaderProps } from "src/components/PageHeader";
import { TabsContentXss } from "src/components/Tabs";
import { Css, Only, Tokens } from "src/Css";
import { useMeasuredHeight } from "src/layouts/useMeasuredHeight";
import { zIndices } from "src/utils/zIndices";

/**
 * SPIKE (DS-154) — Option 1.
 *
 * Evolves today's auto-hide behavior: the full `PageHeader` slides up out of view on
 * scroll-down and slides back in on scroll-up, exactly like `useAutoHideOnScroll` today —
 * including reveal-on-scroll-up working from anywhere on the page, not just near the top.
 * The difference from today: once fully hidden, a compact bar (breadcrumbs + rightSlot)
 * fades and slides in, pinned to the top, instead of leaving nothing visible. Scrolling
 * back up hides the compact bar and reveals the full header again.
 *
 * The full header is `position: fixed` with an animated `top` (0 revealed, `-headerHeight`
 * hidden) rather than `position: relative` + `transform` — `transform` doesn't change an
 * element's document-flow position, so "revealing" it would just return it to wherever it
 * naturally sits in the document (off-screen if you're scrolled deep into the page).
 * `position: fixed` pins `top` to the current viewport regardless of scroll depth, matching
 * how `PageHeaderLayout.tsx`/`NavbarLayout.tsx` actually do this today. A spacer div sized
 * to the measured header height (via the existing `useMeasuredHeight` hook, which has no
 * layout-context dependency) reserves space in the flow so the body doesn't jump when the
 * header leaves it.
 *
 * Rough/self-contained on purpose — no dependency on `useAutoHideOnScroll` or the layout
 * context providers, since this is a throwaway prototype for design review only.
 */
const THRESHOLD = 80;

// Combined opacity+transform transition — Truss's `transitionOpacity`/`transitionTransform`
// getters each set (not compose) the `transition` property, so combining both properties
// needs a literal string rather than chaining two getters. Reuses the same 200ms
// cubic-bezier easing Css.ts uses for its own canned transitions.
const COMPACT_BAR_TRANSITION =
  "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)";

export type Option1CompactOnAutoHideProps<V extends string, X> = {
  pageHeader: PageHeaderProps<V, X>;
  /** Omit rightSlot from the compact bar once the header is scrolled/hidden. */
  hideRightSlotOnScroll?: boolean;
  children?: ReactNode;
};

export function Option1CompactOnAutoHide<V extends string, X extends Only<TabsContentXss, X>>(
  props: Option1CompactOnAutoHideProps<V, X>,
) {
  const { pageHeader, hideRightSlotOnScroll, children } = props;
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMeasuredHeight(headerRef, true);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const dy = y - lastScrollY.current;
      lastScrollY.current = y;

      if (y <= THRESHOLD) setHidden(false);
      else if (dy > 0) setHidden(true);
      else if (dy < 0) setHidden(false);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div css={Css.df.fdc.w100.$}>
      {/* Spacer reserves height in the flow while the header itself is `position: fixed`. */}
      <div css={Css.fs0.w100.$} style={{ height: headerHeight }}>
        <div
          ref={headerRef}
          css={Css.fixed.top0.left0.w100.z(zIndices.pageStickyHeader).transitionTop.$}
          style={{ top: hidden ? -headerHeight : 0 }}
        >
          <PageHeader {...pageHeader} />
        </div>
      </div>

      <div
        css={
          Css.fixed.top0.left0.w100
            .z(zIndices.pageStickyHeader)
            .df.aic.jcsb.gap2.px3.py1.bb.bgColor(Tokens.Surface)
            .bc(Tokens.SurfaceSeparator).$
        }
        style={{
          transition: COMPACT_BAR_TRANSITION,
          opacity: hidden ? 1 : 0,
          transform: hidden ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: hidden ? "auto" : "none",
        }}
      >
        {pageHeader.breadcrumbs && <Breadcrumbs {...pageHeader.breadcrumbs} />}
        {!hideRightSlotOnScroll && <div css={Css.fs0.$}>{pageHeader.rightSlot}</div>}
      </div>

      {children}
    </div>
  );
}
