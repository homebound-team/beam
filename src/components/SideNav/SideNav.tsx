import { ReactNode } from "react";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { allItemsHaveIcons } from "src/components/AppNav/appNavUtils";
import { Css, Tokens } from "src/Css";
import { useSideNavLayoutContext } from "src/layouts/SideNavLayout/SideNavLayoutContext";
import { useTestIds } from "src/utils";

export type SideNavProps = {
  /** Optional area above the item list (logo, workspace switcher, etc.). */
  top?: ReactNode;
  /** Top-level entries — links, link groups, and/or sections. */
  items: AppNavItem[];
  /** Optional area pinned to the bottom (user menu, settings, sign-out). */
  footer?: ReactNode;
  /** Keep `top` / `items` / `footer` in the collapsed rail (icon-only items). Default hides them. */
  showContentWhenCollapsed?: boolean;
};

export function SideNav(props: SideNavProps) {
  const { top, items, footer, showContentWhenCollapsed = false } = props;
  const { navState } = useSideNavLayoutContext();
  const tid = useTestIds(props, "sideNav");

  const panelCollapsed = navState === "collapse";
  const hideContent = panelCollapsed && !showContentWhenCollapsed;
  // Icon-only rendering only makes sense when every link has an icon — otherwise the rail
  // would show a mix of icons and orphaned blank-label rows. When that's not the case we hide
  // the items list entirely on collapse rather than render a broken-looking nav.
  const hideItems = hideContent || (panelCollapsed && !allItemsHaveIcons(items));

  return (
    <nav css={Css.df.fdc.h100.fs0.$} {...tid}>
      {!hideContent && top !== undefined && (
        <div css={Css.fs0.px2.pb2.df.aic.if(panelCollapsed).pb4.$} {...tid.top}>
          {top}
        </div>
      )}
      {!hideContent && (
        <div css={Css.fg1.oya.df.fdc.px1.py1.if(top === undefined).pt5.$} {...tid.items}>
          {!hideItems && <AppNavItems items={items} panelCollapsed={panelCollapsed} />}
        </div>
      )}
      {!hideContent && footer !== undefined && (
        <div css={Css.fs0.px2.py2.bt.bc(Tokens.SurfaceSeparator).$} {...tid.footer}>
          {footer}
        </div>
      )}
    </nav>
  );
}
