import { camelCase } from "change-case";
import { AppNavGroupView } from "src/components/AppNav/AppNavGroup";
import { AppNavGroupMenu } from "src/components/AppNav/AppNavGroupMenu";
import { AppNavSectionView } from "src/components/AppNav/AppNavSectionView";
import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { appNavItemKey, isAppNavGroup, isAppNavLink, isAppNavSection } from "src/components/AppNav/appNavUtils";
import type { NavLinkVariant } from "src/components/NavLinks";
import { NavLink } from "src/components/NavLinks";
import { useTestIds } from "src/utils";

export type AppNavItemsProps = {
  items: AppNavItem[];
  /**
   * Visual treatment. `"side"` (default) renders an expand/collapse disclosure for groups; `"global"`
   * renders groups as dropdown menus for the top-nav toolbar.
   */
  variant?: NavLinkVariant;
  /** Side-nav only: collapse links to icon-only rows. Ignored by the `"global"` variant. */
  panelCollapsed?: boolean;
};

// Results in a section, grouped, or flat list of `<NavLink />` components. The `"side"` variant
// (SideNav, NavbarMobileMenu) renders groups as disclosures; `"global"` (Navbar toolbar) renders
// them as dropdown menus.
export function AppNavItems(props: AppNavItemsProps) {
  const { items, variant = "side", panelCollapsed = false } = props;
  const tid = useTestIds(props, "appNav");

  return (
    <>
      {items.map((item, idx) => {
        if (isAppNavLink(item)) {
          return (
            <NavLink
              key={appNavItemKey(item)}
              variant={variant}
              {...item}
              iconOnly={item.iconOnly ?? (panelCollapsed && !!item.icon)}
              {...tid[`link_${camelCase(item.label)}`]}
            />
          );
        }
        if (isAppNavGroup(item)) {
          return variant === "global" ? (
            <AppNavGroupMenu key={appNavItemKey(item)} linkGroup={item} {...tid.linkGroup} />
          ) : (
            <AppNavGroupView
              key={appNavItemKey(item)}
              linkGroup={item}
              panelCollapsed={panelCollapsed}
              {...tid.linkGroup}
            />
          );
        }
        if (isAppNavSection(item)) {
          return (
            <AppNavSectionView
              key={appNavItemKey(item)}
              section={item}
              variant={variant}
              panelCollapsed={panelCollapsed}
              showDivider={idx < items.length - 1}
              {...tid.section}
            />
          );
        }
        return null;
      })}
    </>
  );
}
