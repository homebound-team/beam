import { ReactNode, useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "src/components/Breadcrumbs";
import { PageHeaderProps } from "src/components/PageHeader";
import { TabsContentXss } from "src/components/Tabs";
import { Css, Only, Tokens } from "src/Css";
import { zIndices } from "src/utils/zIndices";

/**
 * SPIKE (DS-154) — Option 2.
 *
 * The header stays pinned to the top the whole time (`position: sticky`, never slides
 * away). Direction-aware, matching today's real auto-hide behavior: scrolling down past a
 * threshold collapses the full header down to a condensed breadcrumbs + rightSlot strip;
 * any upward scroll re-expands it, from anywhere on the page (not just near the top).
 *
 * Renders one persistent row (a collapsible breadcrumbs row + the page title solo + optional
 * rightSlot) — the same approach Option 3 uses instead of rendering `PageHeader` wholesale —
 * rather than conditionally swapping between two different DOM subtrees. `collapsed` just
 * flips target CSS values (breadcrumbs row max-height/opacity, container padding, rightSlot
 * opacity) through ordinary `transition`s on elements that never unmount, so the browser
 * interpolates continuously across the change and it reads as a genuine shrink/slide rather
 * than an instant snap papered over with an opacity crossfade. The title itself never
 * resizes — it's shown solo, at its normal size, once breadcrumbs have collapsed away. Can't
 * reuse `PageHeader` for the expanded state for the same reason Option 3 can't — it renders
 * title+breadcrumbs+rightSlot as one indivisible block, so there's no way to collapse only
 * the breadcrumbs.
 *
 * Collapsing/expanding still changes the sticky header's own height while it's pinned to the
 * viewport top, which trips the browser's scroll-anchoring compensation — the browser
 * silently nudges `scrollY` to keep visible content stable, that nudge fires its own
 * scroll event, and the handler reads its direction as a real user scroll and flips the
 * state right back, forever. Setting `overflow-anchor: none` on the header's own element
 * does NOT fully prevent this — that property only opts *that* element out of being chosen
 * as the anchor; the browser is still free to anchor to a *different* node (e.g. the body
 * content just below) and still shift `scrollY` to compensate. The real fix has to disable
 * anchoring at the actual scroll container — for document/window scrolling, that's the
 * root `<html>` element — so it's set imperatively on `document.documentElement` for as
 * long as this component is mounted. A small hysteresis band plus a minimum-delta gate are
 * kept as cheap defense-in-depth against any remaining jitter.
 *
 * A separate, OS-driven variant of the same symptom: flinging a trackpad scroll all the way
 * to the bottom of the page can overshoot and rubber-band/bounce back a few pixels before
 * settling (most visible on macOS). That bounce genuinely reports a couple of small negative
 * `dy` scroll events as it recoils toward the true max — indistinguishable from real
 * scroll-up input by delta alone, so without a guard the recoil flips this to "expanded" and
 * the next settle-forward event flips it right back, producing a brief flicker at the very
 * bottom. `useAutoHideOnScroll.ts` already solves this for the real auto-hide chrome by
 * computing `atBottom` fresh every scroll event and refusing to treat a negative delta as a
 * reveal trigger while at the bottom — mirrored here the same way.
 *
 * Rough/self-contained on purpose — no dependency on `useAutoHideOnScroll` or the layout
 * context providers, since this is a throwaway prototype for design review only.
 */
const COLLAPSE_AT = 160;
const EXPAND_AT = 100;
/** Ignore scroll deltas smaller than this — real user scrolls are always well above it. */
const MIN_DELTA = 4;

const TRANSITION_MS = 220;
const EASING = `cubic-bezier(0.4, 0, 0.2, 1)`;

// Expanded/collapsed target values, reached via a CSS transition between two snapped
// states. Breadcrumbs (rendered via the real `Breadcrumbs` component) set their own fixed
// `Css.xs` font-size internally, so unlike a plain `<h1>` there's no font-size to lerp from
// the outside — collapsing them to nothing is done via `max-height` (a little above their
// natural ~16px line height) + `opacity` on a wrapping, `overflow: hidden` div instead.
const BREADCRUMBS_MAX_HEIGHT = [20, 0] as const;
const HEADER_PADDING_Y = [24, 8] as const;

export type Option2SnapCollapseToBreadcrumbsProps<V extends string, X> = {
  pageHeader: PageHeaderProps<V, X>;
  /** Fade rightSlot out once the header collapses. */
  hideRightSlotOnScroll?: boolean;
  children?: ReactNode;
};

export function Option2SnapCollapseToBreadcrumbs<V extends string, X extends Only<TabsContentXss, X>>(
  props: Option2SnapCollapseToBreadcrumbsProps<V, X>,
) {
  const { pageHeader, hideRightSlotOnScroll, children } = props;
  const { title, breadcrumbs, rightSlot } = pageHeader;
  const [collapsed, setCollapsed] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Disable scroll anchoring at the actual scroll container (the document) for as long
    // as this story is mounted — see the file-level comment for why this has to live here
    // rather than on the header element itself.
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
      if (Math.abs(dy) < MIN_DELTA) return;

      if (y <= EXPAND_AT) {
        setCollapsed(false);
        return;
      }
      const doc = document.documentElement;
      const atBottom = y >= doc.scrollHeight - doc.clientHeight;

      if (dy > 0 && y > COLLAPSE_AT) setCollapsed(true);
      else if (dy < 0 && !atBottom) setCollapsed(false);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div css={Css.df.fdc.w100.$}>
      <div
        css={Css.sticky.top0.z(zIndices.pageStickyHeader).bb.bc(Tokens.SurfaceSeparator).bgColor(Tokens.Surface).$}
        style={{
          overflowAnchor: "none",
          transition: `padding ${TRANSITION_MS}ms ${EASING}`,
          paddingTop: target(HEADER_PADDING_Y, collapsed),
          paddingBottom: target(HEADER_PADDING_Y, collapsed),
        }}
      >
        <div css={Css.df.jcsb.aic.gap2.px3.$}>
          <div css={Css.mw0.$}>
            {breadcrumbs && (
              <div
                aria-hidden={collapsed}
                css={Css.oh.$}
                style={{
                  transition: `max-height ${TRANSITION_MS}ms ${EASING}, opacity ${TRANSITION_MS}ms ${EASING}`,
                  maxHeight: target(BREADCRUMBS_MAX_HEIGHT, collapsed),
                  opacity: collapsed ? 0 : 1,
                }}
              >
                <Breadcrumbs {...breadcrumbs} />
              </div>
            )}
            <h1 css={Css.xl.mw0.truncate.$}>{title}</h1>
          </div>
          {hideRightSlotOnScroll ? (
            <div
              css={Css.fs0.$}
              style={{
                transition: `opacity ${TRANSITION_MS}ms ${EASING}, visibility 0s linear ${collapsed ? TRANSITION_MS : 0}ms`,
                opacity: collapsed ? 0 : 1,
                pointerEvents: collapsed ? "none" : "auto",
                visibility: collapsed ? "hidden" : "visible",
              }}
            >
              {rightSlot}
            </div>
          ) : (
            <div css={Css.fs0.$}>{rightSlot}</div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

function target([from, to]: readonly [number, number], collapsed: boolean): number {
  return collapsed ? to : from;
}
