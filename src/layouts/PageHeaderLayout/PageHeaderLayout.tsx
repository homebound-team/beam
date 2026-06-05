import { CSSProperties, ReactNode, useCallback, useMemo, useRef } from "react";
import { PageHeader, PageHeaderProps } from "src/components/PageHeader";
import { TabsContentXss } from "src/components/Tabs";
import { Css, Only } from "src/Css";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import {
  beamLayoutViewportWidthVar,
  beamNavbarLayoutHeightVar,
  beamPageHeaderLayoutHeightVar,
  beamSideNavLayoutWidthVar,
} from "../layoutVars";
import { useNavbarLayoutHeight } from "../NavbarLayout/NavbarLayoutHeightContext";
import { useAutoHideOnScroll } from "../useAutoHideOnScroll";
import { useMeasuredHeight } from "../useMeasuredHeight";

export type PageHeaderLayoutProps<V extends string, X> = {
  /** Props for the {@link PageHeader} rendered as the page-level header. Omit to render no header. */
  pageHeader?: PageHeaderProps<V, X>;
  /** Slot: main page body (tables, forms, etc.). */
  children?: ReactNode;
};

/**
 * Vertical shell: page header + body. Slots have no intrinsic sizing — fill the parent from the app.
 *
 * The header auto-hides below the {@link NavbarLayout} navbar (scrolls away on scroll-down, slides back in
 * pinned past a threshold on scroll-up) and stays horizontally sticky beside the side nav. Publishes its
 * height ({@link beamPageHeaderLayoutHeightVar}) as a CSS var for sticky chrome below it.
 *
 * Canonical contract: `docs/layouts.md`.
 */
export function PageHeaderLayout<V extends string, X extends Only<TabsContentXss, X>>(
  props: PageHeaderLayoutProps<V, X>,
) {
  const { pageHeader, children } = props;
  const tid = useTestIds(props, "pageHeaderLayout");

  // The navbar's visible height (px) — the y-coordinate the header pins to when revealed. Read from the
  // NavbarLayout context (mirrored into a ref) so the scroll handler avoids a per-scroll `getComputedStyle`.
  const navbarHeight = useNavbarLayoutHeight();
  const navbarHeightRef = useRef(navbarHeight);
  navbarHeightRef.current = navbarHeight;
  const getNavbarBottom = useCallback(() => navbarHeightRef.current, []);

  const headerMetricsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMeasuredHeight(headerMetricsRef, pageHeader != null);

  const { state: autoHideState, atTop } = useAutoHideOnScroll(spacerRef, pageHeader != null, getNavbarBottom);
  const headerOccupiesPosition = autoHideState === "revealed" || atTop;

  const cssVars: Record<string, string> | undefined =
    pageHeader != null && headerHeight > 0 && headerOccupiesPosition
      ? { [beamPageHeaderLayoutHeightVar]: `${headerHeight}px` }
      : undefined;

  const headerLeft = `var(${beamSideNavLayoutWidthVar}, 0px)`;
  const headerWidth = `calc(var(${beamLayoutViewportWidthVar}, 100vw) - var(${beamSideNavLayoutWidthVar}, 0px))`;
  const outerTop = `var(${beamNavbarLayoutHeightVar}, 0px)`;

  const innerCss =
    autoHideState === "static"
      ? // Sticky w/ only `left` (no `top`) — scrolls away vertically, but stays pinned beside the side
        // nav during horizontal scroll on wide pages.
        Css.sticky.left(headerLeft).w(headerWidth).z(zIndices.pageStickyHeader).$
      : // Detached: `position: fixed`; the dynamic `top` (set inline below) slides it in/out below the navbar.
        Css.fixed.left(headerLeft).w(headerWidth).z(zIndices.pageStickyHeader).add("transition", "top 200ms ease").$;

  // Hidden = revealed minus headerHeight, so the slide always travels exactly headerHeight regardless of
  // where the navbar puts the revealed baseline — keeping it in lockstep with the navbar's own slide.
  const innerStyle: CSSProperties | undefined =
    autoHideState !== "static"
      ? { top: autoHideState === "revealed" ? outerTop : `calc(${outerTop} - ${headerHeight}px)` }
      : undefined;

  // Memoize the PageHeader element so the layout's scroll-state re-renders (and the navbar-height
  // context changing) only update the wrapper's css/style, not re-render the PageHeader itself.
  const pageHeaderEl = useMemo(() => (pageHeader != null ? <PageHeader {...pageHeader} /> : null), [pageHeader]);

  return (
    <DocumentScrollLayoutProvider>
      <div css={Css.df.fdc.w100.$} style={cssVars} {...tid}>
        {pageHeaderEl != null && (
          // Outer placeholder always reserves the header height so content never jumps when the inner
          // flips to `position: fixed`.
          <div ref={spacerRef} css={Css.fs0.w100.$} style={{ height: headerHeight }}>
            <div ref={headerMetricsRef} css={innerCss} style={innerStyle} {...tid.pageHeader}>
              {pageHeaderEl}
            </div>
          </div>
        )}
        <div css={Css.df.fdc.fg1.mh0.w100.$} {...tid.body}>
          {children}
        </div>
      </div>
    </DocumentScrollLayoutProvider>
  );
}
