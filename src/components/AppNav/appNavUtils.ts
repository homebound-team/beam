import type {
  AppNavGroup,
  AppNavItem,
  AppNavLink,
  AppNavSection,
  AppNavSectionItem,
} from "src/components/AppNav/appNavTypes";
import type { MenuItem } from "src/components/ButtonMenu";

export function isAppNavLink(item: AppNavItem | AppNavSectionItem): item is AppNavLink {
  return !("items" in item);
}

export function isAppNavSection(item: AppNavItem | AppNavSectionItem): item is AppNavSection {
  return "section" in item && item.section === true;
}

export function isAppNavGroup(item: AppNavItem | AppNavSectionItem): item is AppNavGroup {
  return "items" in item && Array.isArray(item.items) && "label" in item && !isAppNavSection(item);
}

/** All leaf links in a link group (flattens sections and nested groups).
 * Used when side nav panel is collapsed and we're only showing the actual links - not the sections or groups.
 * Also used to traverse the link group to check for the active link.
 */
export function appNavLinkGroupLinks(linkGroup: AppNavGroup): AppNavLink[] {
  return linkGroup.items.flatMap((item) => {
    if (isAppNavLink(item)) {
      return [item];
    }
    if (isAppNavSection(item)) {
      return item.items.flatMap((child) => {
        if (isAppNavLink(child)) {
          return [child];
        }
        if (isAppNavGroup(child)) {
          return appNavLinkGroupLinks(child);
        }
        if (isAppNavSection(child)) {
          return appNavSectionLinks(child);
        }
        return [];
      });
    }
    if (isAppNavGroup(item)) {
      return appNavLinkGroupLinks(item);
    }
    return [];
  });
}

/** Get all the links in a section (flattens nested sections and groups). */
function appNavSectionLinks(section: AppNavSection): AppNavLink[] {
  return section.items.flatMap((child) => {
    if (isAppNavLink(child)) {
      return [child];
    }
    if (isAppNavGroup(child)) {
      return appNavLinkGroupLinks(child);
    }
    if (isAppNavSection(child)) {
      return appNavSectionLinks(child);
    }
    return [];
  });
}

/** Groups of links for menu dividers (unlabeled sections and contiguous plain links). */
export function appNavLinkGroupMenuSections(linkGroup: AppNavGroup): AppNavLink[][] {
  const sections: AppNavLink[][] = [];
  let flatLinks: AppNavLink[] = [];

  const flushFlatLinks = () => {
    if (flatLinks.length > 0) {
      sections.push(flatLinks);
      flatLinks = [];
    }
  };

  for (const item of linkGroup.items) {
    if (isAppNavSection(item)) {
      flushFlatLinks();
      sections.push(appNavSectionLinks(item));
    } else if (isAppNavLink(item)) {
      flatLinks.push(item);
    } else if (isAppNavGroup(item)) {
      flushFlatLinks();
      sections.push(appNavLinkGroupLinks(item));
    }
  }

  flushFlatLinks();
  return sections;
}

/** Helper method to generate a unique key for an item in the app nav. */
export function appNavItemKey(item: AppNavItem | AppNavSectionItem): string {
  if (isAppNavLink(item)) return item.label;
  if (isAppNavGroup(item)) return item.label;
  if (item.label) return item.label;
  return `section-${item.items.map((child) => appNavItemKey(child)).join("--")}`;
}

/** Maps a {@link AppNavGroup} to {@link ButtonMenu} items, with dividers between {@link AppNavSection}s. */
export function linkGroupToMenuItems(linkGroup: AppNavGroup): MenuItem[] {
  return appNavLinkGroupMenuSections(linkGroup).flatMap((sectionLinks, sectionIndex) =>
    sectionLinks.map((link, itemIndex) => {
      const { onClick } = link;
      return {
        label: link.label,
        // nav-link handlers take a PressEvent; the Menu calls onClick with none, so drop the arg.
        onClick: typeof onClick === "function" ? () => void (onClick as VoidFunction)() : (onClick ?? ""),
        disabled: link.disabled,
        ...(sectionIndex > 0 && itemIndex === 0 ? { hasDivider: true } : {}),
      };
    }),
  );
}

export function linkGroupHasActiveLink(linkGroup: AppNavGroup): boolean {
  return appNavLinkGroupLinks(linkGroup).some((link) => link.active);
}

/** Helper method to check if all items in the app nav have icons. */
export function allItemsHaveIcons(items: AppNavItem[]): boolean {
  return items.every((item) => entryHasIcons(item));
}

/** Helper method to check if an item has an icon. */
function entryHasIcons(item: AppNavItem | AppNavSectionItem): boolean {
  if (isAppNavLink(item)) return !!item.icon;
  if (isAppNavGroup(item)) return appNavLinkGroupLinks(item).every((link) => !!link.icon);
  return item.items.every((child) => entryHasIcons(child));
}
