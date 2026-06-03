import type { AppNavItem } from "src/components/AppNav/appNavTypes";
import { isAppNavLink } from "src/components/AppNav/appNavUtils";

/** Entries rendered in the mobile flyout (excludes compact icon-only toolbar links). */
export function navbarItemsForMobileDrawer(items: AppNavItem[]): AppNavItem[] {
  return items.filter((item) => !isNavbarToolbarOnlyLink(item));
}

export function isNavbarToolbarOnlyLink(item: AppNavItem): boolean {
  return isAppNavLink(item) && !!item.iconOnly && !!item.icon;
}
