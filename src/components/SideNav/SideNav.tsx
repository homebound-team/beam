import { ReactNode } from "react";
import { SideNavItems } from "src/components/SideNav/SideNavItems";
import type { SideNavItem } from "src/components/SideNav/sideNavTypes";
import { allItemsHaveIcons } from "src/components/SideNav/sideNavUtils";
import { Css, Tokens } from "src/Css";
import { useSideNavLayoutContext } from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { useTestIds } from "src/utils";

export type {
  SideNavItem,
  SideNavLink,
  SideNavLinkGroup,
  SideNavSection,
  SideNavSectionItem,
} from "src/components/SideNav/sideNavTypes";

export type SideNavProps = {
  /** Optional area above the item list (logo, workspace switcher, etc.). */
  top?: ReactNode;
  /** Top-level entries — links, link groups, and/or sections. */
  items: SideNavItem[];
  /** Optional area pinned to the bottom (user menu, settings, sign-out). */
  footer?: ReactNode;
};

export function SideNav(props: SideNavProps) {
  const { top, items, footer } = props;
  const { navState } = useSideNavLayoutContext();
  const tid = useTestIds(props, "sideNav");

  const panelCollapsed = navState === "collapse";
  // Icon-only rendering only makes sense when every link has an icon — otherwise the rail
  // would show a mix of icons and orphaned blank-label rows. When that's not the case we hide
  // the items list entirely on collapse rather than render a broken-looking nav.
  const hideOnCollapse = panelCollapsed && !allItemsHaveIcons(items);

  return (
    <nav css={Css.df.fdc.h100.fs0.$} {...tid}>
      {top !== undefined && (
        <div css={Css.fs0.px2.pb2.df.aic.if(panelCollapsed).pb4.$} {...tid.top}>
          {top}
        </div>
      )}
      <div css={Css.fg1.oya.df.fdc.px1.py1.if(top === undefined).pt5.$} {...tid.items}>
        {!hideOnCollapse && <SideNavItems items={items} panelCollapsed={panelCollapsed} />}
      </div>
      {footer !== undefined && (
        <div css={Css.fs0.px2.py2.bt.bc(Tokens.SurfaceSeparator).$} {...tid.footer}>
          {footer}
        </div>
      )}
    </nav>
  );
}
