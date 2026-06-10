import { createContext, ReactNode, useContext } from "react";

const NavbarLayoutHeightContext = createContext(0);

/** Navbar occupying height (px); mirrors {@link beamNavbarLayoutHeightVar} for JS consumers. */
export function NavbarLayoutHeightProvider({ value, children }: { value: number; children: ReactNode }) {
  return <NavbarLayoutHeightContext.Provider value={value}>{children}</NavbarLayoutHeightContext.Provider>;
}

/** Navbar occupying height (px). `0` when scrolled away or outside `NavbarLayout`. */
export function useNavbarLayoutHeight(): number {
  return useContext(NavbarLayoutHeightContext);
}
