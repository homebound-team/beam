import { useResizeObserver } from "@react-aria/utils";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Navbar, NavbarProps } from "src/components/Navbar/Navbar";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import { beamLayoutViewportHeightVar, beamLayoutViewportWidthVar, beamNavbarLayoutHeightVar } from "../layoutVars";
import { useAutoHideOnScroll } from "../useAutoHideOnScroll";
import { useMeasuredHeight } from "../useMeasuredHeight";
import { NavbarLayoutHeightProvider } from "./NavbarLayoutHeightContext";

export type NavbarLayoutProps = {
  /** Props for the {@link Navbar} rendered as the top application chrome. Omit to render no navbar. */
  navbar?: NavbarProps;
  /** Slot: main region below the navbar (often a {@link SideNavLayout} or {@link PageHeaderLayout}). */
  children?: ReactNode;
};

/**
 * Vertical shell: navbar + body. Slots have no intrinsic sizing — fill the parent from the app.
 *
 * The navbar auto-hides: it scrolls away on scroll-down and slides back in pinned past a threshold on
 * scroll-up, with an outer placeholder reserving its height so content never jumps. Publishes the navbar
 * height ({@link beamNavbarLayoutHeightVar}) and visible viewport size
 * ({@link beamLayoutViewportWidthVar} / {@link beamLayoutViewportHeightVar}) as CSS vars for chrome below it.
 *
 * Canonical contract: `docs/layouts.md`.
 */
export function NavbarLayout(props: NavbarLayoutProps) {
  const { navbar, children } = props;
  const tid = useTestIds(props, "navbarLayout");
  const navMetricsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const docElementRef = useRef<HTMLElement | null>(typeof document !== "undefined" ? document.documentElement : null);

  const navHeight = useMeasuredHeight(navMetricsRef, navbar != null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const syncViewportSize = useCallback(() => {
    const el = docElementRef.current;
    if (!el) return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    // Bail when unchanged so a ResizeObserver fire with no size delta doesn't re-render.
    setViewportSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  useResizeObserver({ ref: docElementRef, onResize: syncViewportSize });
  useLayoutEffect(() => {
    syncViewportSize();
  }, [syncViewportSize]);

  const { state: autoHideState, atTop } = useAutoHideOnScroll(spacerRef, navbar != null);
  const navOccupiesViewportTop = autoHideState === "revealed" || atTop;

  // Occupying height (else 0), published as a CSS var (CSS consumers) and via context (PageHeaderLayout).
  const navbarOffsetPx = navbar != null && navHeight > 0 && navOccupiesViewportTop ? navHeight : 0;

  const cssVars: Record<string, string> = {};
  if (navbarOffsetPx > 0) {
    cssVars[beamNavbarLayoutHeightVar] = `${navbarOffsetPx}px`;
  }
  if (viewportSize.width > 0) {
    cssVars[beamLayoutViewportWidthVar] = `${viewportSize.width}px`;
  }
  if (viewportSize.height > 0) {
    cssVars[beamLayoutViewportHeightVar] = `${viewportSize.height}px`;
  }

  const innerWidth = `var(${beamLayoutViewportWidthVar}, 100vw)`;

  const innerCss =
    autoHideState === "static"
      ? // Sticky w/ only `left` (no `top`) — scrolls away vertically with the document, but stays pinned
        // to the viewport left during horizontal scroll on wide pages.
        Css.sticky.left0.z(zIndices.navbar).w(innerWidth).$
      : // Detached: `position: fixed`; `top` (set inline below) slides it between hidden/revealed.
        Css.fixed.left0.z(zIndices.navbar).w(innerWidth).add("transition", "top 200ms ease").$;

  const innerStyle: CSSProperties | undefined =
    autoHideState !== "static" ? { top: autoHideState === "revealed" ? 0 : -navHeight } : undefined;

  // Memoize the Navbar element so the layout's scroll-state re-renders (which only change the wrapper's
  // css/style below) don't re-render the Navbar itself.
  const navbarEl = useMemo(() => (navbar != null ? <Navbar {...navbar} /> : null), [navbar]);

  return (
    <DocumentScrollLayoutProvider>
      <NavbarLayoutHeightProvider value={navbarOffsetPx}>
        <div css={Css.df.fdc.wfc.mw100.$} style={Object.keys(cssVars).length > 0 ? cssVars : undefined} {...tid}>
          {navbarEl != null && (
            // Outer placeholder always reserves the navbar height so content never jumps when the inner
            // flips to `position: fixed`.
            <div ref={spacerRef} css={Css.fs0.w100.$} style={{ height: navHeight }}>
              <div ref={navMetricsRef} css={innerCss} style={innerStyle} {...tid.navbar}>
                {navbarEl}
              </div>
            </div>
          )}
          <div css={Css.df.fdc.mh0.mw100.w100.$} {...tid.body}>
            {children}
          </div>
        </div>
      </NavbarLayoutHeightProvider>
    </DocumentScrollLayoutProvider>
  );
}
