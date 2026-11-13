import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import { Navbar, type NavbarProps } from "src/components/Navbar/Navbar";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import { useEnvironmentBannerLayoutHeight } from "../EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import {
  beamEnvironmentBannerLayoutHeightVar,
  beamLayoutViewportWidthVar,
  beamNavbarLayoutHeightVar,
} from "../layoutVars";
import { useMeasuredHeight } from "../useMeasuredHeight";
import { useScrollWithPage } from "../useScrollWithPage";
import { MobileSubNavProvider } from "./MobileSubNavContext";
import { setNavbarVisibleHeight } from "./navbarVisibleHeight";

export type NavbarLayoutProps = {
  /** Props for the {@link Navbar} rendered as the top application chrome. */
  navbar: NavbarProps;
  /** Slot: main region below the navbar (often a {@link SideNavLayout} or {@link PageHeaderLayout}). */
  children?: ReactNode;
};

/** Navbar + body shell. The navbar scrolls with the page, then hides and reveals. Contract: `docs/layouts.md`. */
export function NavbarLayout(props: NavbarLayoutProps) {
  const { navbar, children } = props;
  const tid = useTestIds(props, "navbarLayout");
  const heightElRef = useRef<HTMLDivElement>(null);
  const fixedElRef = useRef<HTMLDivElement>(null);
  const reserveElRef = useRef<HTMLDivElement>(null);
  const navHeight = useMeasuredHeight(fixedElRef, true);
  const bannerHeight = useEnvironmentBannerLayoutHeight();

  useScrollWithPage({
    heightElRef,
    fixedElRef,
    reserveElRef,
    height: navHeight,
    restingTop: `var(${beamEnvironmentBannerLayoutHeightVar}, 0px)`,
    heightVar: beamNavbarLayoutHeightVar,
    getReserveRestTop: () => bannerHeight,
    onVisibleHeight: setNavbarVisibleHeight,
  });

  const innerWidth = `var(${beamLayoutViewportWidthVar}, 100vw)`;
  // Always `fixed` so horizontal document scroll cannot move the navbar (same as the env banner).
  const innerCss = Css.fixed.left0.z(zIndices.navbar).w(innerWidth).$;

  // Memoize so a measured-height update doesn't re-render Navbar.
  const navbarEl = useMemo(() => <Navbar {...navbar} />, [navbar]);

  return (
    <DocumentScrollLayoutProvider>
      <MobileSubNavProvider>
        <div ref={heightElRef} css={Css.df.fdc.wfc.mw100.$} {...tid}>
          {/* Keeps the navbar's space in the flow while the navbar is fixed. */}
          <div ref={reserveElRef} css={Css.fs0.w100.$} style={{ height: navHeight }}>
            <div ref={fixedElRef} css={innerCss} {...tid.navbar}>
              {navbarEl}
            </div>
          </div>
          <div css={Css.df.fdc.mh0.mw100.w100.$} {...tid.body}>
            {children}
          </div>
        </div>
      </MobileSubNavProvider>
    </DocumentScrollLayoutProvider>
  );
}
