import type { CSSProperties, ReactNode } from "react";
import { useMemo, useRef } from "react";
import { Navbar, NavbarProps } from "src/components/Navbar/Navbar";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import { beamLayoutViewportWidthVar, beamNavbarLayoutHeightVar } from "../layoutVars";
import { useAutoHideOnScroll } from "../useAutoHideOnScroll";
import { useMeasuredHeight } from "../useMeasuredHeight";
import { NavbarLayoutHeightProvider } from "./NavbarLayoutHeightContext";

export type NavbarLayoutProps = {
  /** Props for the {@link Navbar} rendered as the top application chrome. */
  navbar: NavbarProps;
  /** Slot: main region below the navbar (often a {@link SideNavLayout} or {@link PageHeaderLayout}). */
  children?: ReactNode;
};

/** Navbar + body shell with auto-hide chrome. Contract: `docs/layouts.md`. */
export function NavbarLayout(props: NavbarLayoutProps) {
  const { navbar, children } = props;
  const tid = useTestIds(props, "navbarLayout");
  const navMetricsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  const navHeight = useMeasuredHeight(navMetricsRef, true);
  const { state: autoHideState, atTop } = useAutoHideOnScroll(spacerRef, true);
  const navOccupiesViewportTop = autoHideState === "revealed" || atTop;

  // Occupying height (else 0) — CSS var + context for PageHeaderLayout.
  const navbarOffsetPx = navHeight > 0 && navOccupiesViewportTop ? navHeight : 0;

  const cssVars: Record<string, string> | undefined =
    navbarOffsetPx > 0 ? { [beamNavbarLayoutHeightVar]: `${navbarOffsetPx}px` } : undefined;

  const innerWidth = `var(${beamLayoutViewportWidthVar}, 100vw)`;

  const innerCss =
    autoHideState === "static"
      ? // Sticky horizontally; scrolls away vertically with the document.
        Css.sticky.left0.z(zIndices.navbar).w(innerWidth).$
      : // Fixed; inline `top` slides between hidden/revealed.
        Css.fixed.left0.z(zIndices.navbar).w(innerWidth).transitionTop.$;

  const innerStyle: CSSProperties | undefined =
    autoHideState !== "static" ? { top: autoHideState === "revealed" ? 0 : -navHeight } : undefined;

  // Memoize so scroll-state re-renders don't re-render Navbar.
  const navbarEl = useMemo(() => <Navbar {...navbar} />, [navbar]);

  return (
    <DocumentScrollLayoutProvider>
      <NavbarLayoutHeightProvider value={navbarOffsetPx}>
        <div css={Css.df.fdc.wfc.mw100.$} style={cssVars} {...tid}>
          {/* Spacer reserves height when inner flips to fixed. */}
          <div ref={spacerRef} css={Css.fs0.w100.$} style={{ height: navHeight }}>
            <div ref={navMetricsRef} css={innerCss} style={innerStyle} {...tid.navbar}>
              {navbarEl}
            </div>
          </div>
          <div css={Css.df.fdc.mh0.mw100.w100.$} {...tid.body}>
            {children}
          </div>
        </div>
      </NavbarLayoutHeightProvider>
    </DocumentScrollLayoutProvider>
  );
}
