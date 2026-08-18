import { createContext, ReactNode, useContext, useLayoutEffect, useMemo, useState } from "react";
import type { SideNavProps } from "src/components/SideNav/SideNav";

/** Nested pane of the mobile nav menu. Drawer-owned fields from {@link SideNavProps}. */
export type MobileSubNavContent = Pick<SideNavProps, "top" | "items" | "footer">;

type MobileSubNavContextValue = {
  mobileSubNav: MobileSubNavContent | null;
  setMobileSubNav: (content: MobileSubNavContent | null) => void;
};

const MobileSubNavContext = createContext<MobileSubNavContextValue | undefined>(undefined);

/** Holds the mobile menu's nested nav. See `docs/layouts.md`. */
export function MobileSubNavProvider(props: { children: ReactNode }) {
  const [mobileSubNav, setMobileSubNav] = useState<MobileSubNavContent | null>(null);
  const value = useMemo(() => ({ mobileSubNav, setMobileSubNav }), [mobileSubNav]);
  return <MobileSubNavContext.Provider value={value}>{props.children}</MobileSubNavContext.Provider>;
}

/** Registered mobile sub-nav; `null` when the drawer has only the main pane. */
export function useMobileSubNav(): MobileSubNavContent | null {
  return useContext(MobileSubNavContext)?.mobileSubNav ?? null;
}

/**
 * Publish `content` as the mobile menu's nested pane while `enabled`.
 * Returns whether a {@link MobileSubNavProvider} exists (i.e. under `NavbarLayout`).
 */
export function useRegisterMobileSubNav(content: MobileSubNavContent, enabled: boolean): boolean {
  const ctx = useContext(MobileSubNavContext);
  const setMobileSubNav = ctx?.setMobileSubNav;
  // Depend on fields, not the `content` object — callers pass `sideNav={{ items }}` inline.
  const { top, items, footer } = content;

  useLayoutEffect(() => {
    if (!setMobileSubNav || !enabled) return;
    setMobileSubNav({ top, items, footer });
  }, [setMobileSubNav, enabled, top, items, footer]);

  // Clear only when disabled or unmounted, not when `items`/`top`/`footer` identity changes.
  useLayoutEffect(() => {
    if (!setMobileSubNav || !enabled) return;
    return () => setMobileSubNav(null);
  }, [setMobileSubNav, enabled]);

  return ctx !== undefined;
}
