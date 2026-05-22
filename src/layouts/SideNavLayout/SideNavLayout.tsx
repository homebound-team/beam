import { ReactNode } from "react";
import { ContrastScope } from "src/components/ContrastScope";
import { IconButton } from "src/components/IconButton";
import { ScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { SideNavLayoutProvider, useHasSideNavLayoutProvider, useSideNavLayoutContext } from "./SideNavLayoutContext";

export type SideNavLayoutProps = {
  /**
   * Content for the side rail. The layout owns the rail's width, surface chrome, and
   * collapse toggle, so any content (`SideNav` from `src/components/SideNav`,
   * or custom JSX) gets the rail look and expand/collapse behavior for free. Content
   * that wants to react to collapse state should consume `useSideNavLayoutContext()`.
   */
  sideNav?: ReactNode;
  children?: ReactNode;
  /** Padding-x forwarded to the content's `ScrollableParent`. Defaults to `3` / 24px. */
  contentPx?: number | string;
  /** Width of the rail when `navState === "expanded"` on `mdAndUp`. On mobile the expanded rail fills the viewport. Defaults to `220`. */
  railWidthPx?: number;
  /** Render the built-in collapse toggle at the bottom of the rail. Defaults to `true`. */
  showCollapseToggle?: boolean;
  /**
   * When true, the rail (chrome + sideNav content) renders inside a `ContrastScope` so
   * `Tokens.Surface`, `Tokens.OnSurface`, NavLink colors, and the toggle resolve to contrast
   * values. Use for dark-sidebar layouts. Defaults to `false`.
   */
  contrastRail?: boolean;
};

export function SideNavLayout(props: SideNavLayoutProps) {
  // Skip our own provider if one already exists upstream — lets consumers (and tests) seed
  // navState via an outer SideNavLayoutProvider without their state getting shadowed.
  const hasProvider = useHasSideNavLayoutProvider();
  if (hasProvider) return <SideNavLayoutContent {...props} />;
  return (
    <SideNavLayoutProvider>
      <SideNavLayoutContent {...props} />
    </SideNavLayoutProvider>
  );
}

function SideNavLayoutContent(props: SideNavLayoutProps) {
  const {
    sideNav,
    children,
    contentPx = 3,
    railWidthPx = 260,
    showCollapseToggle = true,
    contrastRail = false,
  } = props;
  const { navState, setNavState } = useSideNavLayoutContext();
  const bp = useBreakpoint();
  const tid = useTestIds(props, "sideNavLayout");
  const railCollapsedWidthPx = 56;

  const collapsed = navState === "collapse";
  const showRail = sideNav !== undefined && navState !== "hidden";

  // Mobile-first: the rail floats over page content as an absolutely-positioned overlay.
  // Closed = narrow icon strip; expanded = full viewport width takeover (no scrim needed).
  // On mdAndUp, the rail rejoins the flex flow and uses the desktop expanded width.
  const rail = showRail && (
    <div
      css={{
        ...Css.absolute.top0.bottom0.left0.df.fdc.fs0
          .bgColor(Tokens.Surface)
          .color(Tokens.OnSurface)
          .br.bc(Tokens.SurfaceSeparator)
          .pt2.oh.transitionWidth.add("zIndex", zIndices.sideNav).$,
        ...(collapsed ? Css.wPx(railCollapsedWidthPx).$ : Css.w100.$),
        ...(bp.mdAndUp
          ? {
              ...Css.relative.add("zIndex", "auto").$,
              ...Css.wPx(collapsed ? railCollapsedWidthPx : railWidthPx).$,
            }
          : {}),
      }}
      {...tid.sideNav}
    >
      {showCollapseToggle && (
        <div css={Css.absolute.right2.top2.$}>
          <IconButton
            icon={collapsed ? "menuOpen" : "menuClose"}
            label={collapsed ? "Expand navigation" : "Collapse navigation"}
            onClick={() => setNavState(collapsed ? "expanded" : "collapse")}
            {...tid.toggle}
          />
        </div>
      )}
      <div css={Css.fg1.oya.$} {...tid.sideNavContent}>
        {sideNav}
      </div>
    </div>
  );

  return (
    <div css={Css.relative.df.oh.fg1.$} {...tid}>
      {contrastRail ? <ContrastScope>{rail}</ContrastScope> : rail}
      <ScrollableParent px={contentPx} xss={Css.mlPx(railCollapsedWidthPx).if(bp.mdAndUp).ml0.$}>
        {children}
      </ScrollableParent>
    </div>
  );
}
