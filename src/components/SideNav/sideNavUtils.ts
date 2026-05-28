import type {
  SideNavItem,
  SideNavLink,
  SideNavLinkGroup,
  SideNavSection,
  SideNavSectionItem,
} from "src/components/SideNav/sideNavTypes";

export function isSideNavLink(item: SideNavItem | SideNavSectionItem): item is SideNavLink {
  return !("links" in item) && !("items" in item);
}

export function isSideNavLinkGroup(item: SideNavItem | SideNavSectionItem): item is SideNavLinkGroup {
  return "links" in item && Array.isArray(item.links);
}

export function isSideNavSection(item: SideNavItem): item is SideNavSection {
  return "items" in item && Array.isArray(item.items);
}

export function sideNavItemKey(item: SideNavItem | SideNavSectionItem): string {
  if (isSideNavLink(item)) return item.label;
  if (isSideNavLinkGroup(item)) return item.label;
  if (item.label) return item.label;
  return `section-${item.items.map((child) => sideNavItemKey(child)).join("--")}`;
}

export function allItemsHaveIcons(items: SideNavItem[]): boolean {
  return items.every((item) => entryHasIcons(item));
}

function entryHasIcons(item: SideNavItem | SideNavSectionItem): boolean {
  if (isSideNavLink(item)) return !!item.icon;
  if (isSideNavLinkGroup(item)) return item.links.every((link) => !!link.icon);
  return item.items.every((child) => entryHasIcons(child));
}
