import { useCallback, useState } from "react";
import type { SideNavLinkGroup } from "src/components/SideNav/sideNavTypes";

export const SIDE_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY = "beam.sideNav.expandedLinkGroups";

function loadStored(): Record<string, boolean> {
  try {
    const raw =
      typeof window !== "undefined" ? window.localStorage.getItem(SIDE_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistLabel(label: string, expanded: boolean) {
  const updated = { ...loadStored(), [label]: expanded };
  try {
    window.localStorage.setItem(SIDE_NAV_EXPANDED_LINK_GROUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may throw under quota / privacy mode; UI continues to work via in-memory state.
  }
}

/**
 * Persistent open/closed state for one `SideNavLinkGroup`.
 *
 * Resolution priority, by `label`:
 *   1. value previously stored in localStorage (the user's explicit choice wins)
 *   2. any child link is `active` → auto-expand
 *   3. `defaultExpanded` (or false)
 */
export function useSideNavLinkGroupExpanded(linkGroup: SideNavLinkGroup) {
  const { label } = linkGroup;

  const [userExpanded, setUserExpanded] = useState<boolean | null>(() => {
    const stored = loadStored();
    return label in stored ? stored[label] : null;
  });

  const hasActiveLink = linkGroup.links.some((l) => l.active);
  const expanded = userExpanded !== null ? userExpanded : hasActiveLink ? true : (linkGroup.defaultExpanded ?? false);

  const onToggle = useCallback(() => {
    const next = !expanded;
    setUserExpanded(next);
    persistLabel(label, next);
  }, [expanded, label]);

  return { expanded, onToggle };
}
