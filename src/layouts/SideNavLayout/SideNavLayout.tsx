import { CSSProperties, ReactNode } from "react";
import { ContrastScope } from "src/components/ContrastScope";
import { IconButton } from "src/components/IconButton";
import { SideNav, SideNavProps } from "src/components/SideNav/SideNav";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks";
import {
  bannerAndNavbarChromeTop,
  beamEnvironmentBannerLayoutHeightVar,
  beamLayoutViewportHeightVar,
  beamNavbarLayoutHeightVar,
  beamSideNavLayoutWidthVar,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import { SideNavLayoutProvider, useHasSideNavLayoutProvider, useSideNavLayoutContext } from "./SideNavLayoutContext";

export type SideNavLayoutProps = {
  /** Props for the {@link SideNav} in the rail (layout owns width, chrome, and collapse toggle). */
  sideNav: SideNavProps;
  children?: ReactNode;
  /** Rail width when expanded on `mdAndUp`. Defaults to `260`. */
  railWidthPx?: number;
  /** Render the built-in collapse toggle. Defaults to `true`. */
  showCollapseToggle?: boolean;
  /** Wrap the rail in {@link ContrastScope} for dark-sidebar layouts. Defaults to `false`. */
  contrastRail?: boolean;
};

/** Side nav rail + content. Contract: `docs/layouts.md`. */
export function SideNavLayout(props: SideNavLayoutProps) {
  // Skip our own provider when one exists upstream (tests can seed navState).
  const hasProvider = useHasSideNavLayoutProvider();
  if (hasProvider) return <SideNavLayoutContent {...props} />;
  return (
    <SideNavLayoutProvider>
      <SideNavLayoutContent {...props} />
    </SideNavLayoutProvider>
  );
}

function SideNavLayoutContent(props: SideNavLayoutProps) {
  const { sideNav, children, railWidthPx = 260, showCollapseToggle = true, contrastRail = false } = props;
  const { navState, setNavState } = useSideNavLayoutContext();
  const bp = useBreakpoint();
  const tid = useTestIds(props, "sideNavLayout");
  const railCollapsedWidthPx = 56;

  const collapsed = navState === "collapse";
  const showRail = navState !== "hidden";

  // Rail width reserved in content space (mobile overlay only reserves the collapsed strip).
  const railOffsetPx = !showRail ? 0 : !bp.mdAndUp || collapsed ? railCollapsedWidthPx : railWidthPx;

  const navTop = bannerAndNavbarChromeTop();
  const railViewportHeight = `calc(var(${beamLayoutViewportHeightVar}, 100vh) - var(${beamEnvironmentBannerLayoutHeightVar}, 0px) - var(${beamNavbarLayoutHeightVar}, 0px))`;

  const rail = showRail && (
    <div
      css={{
        ...Css.df.fdc.fs0.bgColor(Tokens.Surface).color(Tokens.OnSurface).br.bc(Tokens.SurfaceSeparator).pt2.oh
          .transitionWidth.$,
        ...(bp.mdAndUp
          ? Css.sticky.left0
              .z(zIndices.sideNav)
              .top(navTop)
              .asfs.h(railViewportHeight)
              .wPx(collapsed ? railCollapsedWidthPx : railWidthPx).$
          : {
              ...Css.fixed.left0.top(navTop).bottom0.z(zIndices.sideNav).$,
              ...(collapsed ? Css.wPx(railCollapsedWidthPx).$ : Css.w100.$),
            }),
      }}
      {...tid.sideNav}
    >
      {showCollapseToggle && (
        <div css={Css.absolute.right2.top2.z2.$}>
          <IconButton
            icon={collapsed ? "menuOpen" : "menuClose"}
            label={collapsed ? "Expand navigation" : "Collapse navigation"}
            onClick={() => setNavState(collapsed ? "expanded" : "collapse")}
            {...tid.toggle}
          />
        </div>
      )}
      <div css={Css.fg1.mh0.df.fdc.$} {...tid.sideNavContent}>
        <SideNav {...sideNav} />
      </div>
    </div>
  );

  return (
    <DocumentScrollLayoutProvider>
      <div
        css={Css.df.fdr.w100.$}
        style={{ [beamSideNavLayoutWidthVar]: `${railOffsetPx}px` } as CSSProperties}
        {...tid}
      >
        {contrastRail ? <ContrastScope>{rail}</ContrastScope> : rail}
        <div css={Css.df.fdc.fg1.mh0.w100.if(showRail && !bp.mdAndUp).mlPx(railCollapsedWidthPx).$} {...tid.content}>
          {children}
        </div>
      </div>
    </DocumentScrollLayoutProvider>
  );
}
