import { CSSProperties, ReactNode } from "react";
import { ContrastScope } from "src/components/ContrastScope";
import { IconButton } from "src/components/IconButton";
import { SideNav, SideNavProps } from "src/components/SideNav/SideNav";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks";
import {
  beamLayoutViewportHeightVar,
  beamNavbarLayoutHeightVar,
  beamSideNavLayoutWidthVar,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import { SideNavLayoutProvider, useHasSideNavLayoutProvider, useSideNavLayoutContext } from "./SideNavLayoutContext";

export type SideNavLayoutProps = {
  /**
   * Props for the {@link SideNav} rendered in the rail. The layout owns the rail's width, surface
   * chrome, and collapse toggle; `SideNav` reacts to collapse state via `useSideNavLayoutContext()`.
   */
  sideNav: SideNavProps;
  children?: ReactNode;
  /** Width of the rail when `navState === "expanded"` on `mdAndUp`. On mobile the expanded rail fills the viewport. Defaults to `260`. */
  railWidthPx?: number;
  /** Render the built-in collapse toggle at the top of the rail. Defaults to `true`. */
  showCollapseToggle?: boolean;
  /**
   * When true, the rail (chrome + sideNav content) renders inside a `ContrastScope` so
   * `Tokens.Surface`, `Tokens.OnSurface`, NavLink colors, and the toggle resolve to contrast
   * values. Use for dark-sidebar layouts. Defaults to `false`.
   */
  contrastRail?: boolean;
};

/**
 * Horizontal shell: side nav rail + content. Slots have no intrinsic sizing — fill the parent from the app.
 *
 * On `mdAndUp` the rail is sticky below the navbar; on mobile it's a fixed overlay (icon strip when
 * collapsed, full-viewport when expanded). Publishes its width ({@link beamSideNavLayoutWidthVar}) as a CSS
 * var for `GridTable` sticky-column and `PageHeaderLayout` horizontal offsets.
 *
 * Canonical contract: `docs/layouts.md`.
 */
export function SideNavLayout(props: SideNavLayoutProps) {
  // Skip our own provider if one exists upstream, so consumers/tests can seed navState without it being shadowed.
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

  // Width the rail reserves in content space (feeds the sticky-offset var). On mobile the rail overlays,
  // so it only reserves the collapsed icon-strip footprint (an expanded overlay covers the content anyway).
  const railOffsetPx = !showRail ? 0 : !bp.mdAndUp || collapsed ? railCollapsedWidthPx : railWidthPx;

  const navTop = `var(${beamNavbarLayoutHeightVar}, 0px)`;
  const railViewportHeight = `calc(var(${beamLayoutViewportHeightVar}, 100vh) - var(${beamNavbarLayoutHeightVar}, 0px))`;

  const rail = showRail && (
    <div
      css={{
        ...Css.df.fdc.fs0.bgColor(Tokens.Surface).color(Tokens.OnSurface).br.bc(Tokens.SurfaceSeparator).pt2.oh
          .transitionWidth.$,
        ...(bp.mdAndUp
          ? // Desktop: sticky in-flow column, pinned below the navbar, filling the visible viewport.
            Css.sticky.left0
              .z(zIndices.sideNav)
              .top(navTop)
              .asfs.h(railViewportHeight)
              .wPx(collapsed ? railCollapsedWidthPx : railWidthPx).$
          : // Mobile: fixed overlay below the navbar — icon strip when collapsed, full viewport when expanded.
            {
              ...Css.fixed.left0.top(navTop).bottom0.z(zIndices.sideNav).$,
              ...(collapsed ? Css.wPx(railCollapsedWidthPx).$ : Css.w100.$),
            }),
      }}
      {...tid.sideNav}
    >
      {showCollapseToggle && (
        // `z2` is local to the rail's stacking context (toggle above the SideNav), not a cross-component layer.
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
