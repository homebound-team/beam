import { createContext, ReactNode, useContext } from "react";

const NavbarLayoutHeightContext = createContext(0);

/**
 * Provides the navbar's currently-occupying height (px) — the same value written to
 * {@link beamNavbarLayoutHeightVar} (measured height while pinned at the top, `0` once scrolled away) — so
 * descendants can read it in JS without a per-scroll `getComputedStyle`. Separate from
 * {@link DocumentScrollLayoutProvider} so its changes don't re-render that provider's consumers.
 */
export function NavbarLayoutHeightProvider({ value, children }: { value: number; children: ReactNode }) {
  return <NavbarLayoutHeightContext.Provider value={value}>{children}</NavbarLayoutHeightContext.Provider>;
}

/** The navbar's currently-occupying height (px). `0` when scrolled away or outside a `NavbarLayout`. */
export function useNavbarLayoutHeight(): number {
  return useContext(NavbarLayoutHeightContext);
}
