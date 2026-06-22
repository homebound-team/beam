import { createContext, ReactNode, useContext } from "react";

const EnvironmentBannerLayoutHeightContext = createContext(0);

/** Displayed environment banner height (px); mirrors {@link beamEnvironmentBannerLayoutHeightVar}. */
export function EnvironmentBannerLayoutHeightProvider({ value, children }: { value: number; children: ReactNode }) {
  return (
    <EnvironmentBannerLayoutHeightContext.Provider value={value}>
      {children}
    </EnvironmentBannerLayoutHeightContext.Provider>
  );
}

/** Displayed environment banner height (px). `0` when hidden. */
export function useEnvironmentBannerLayoutHeight(): number {
  return useContext(EnvironmentBannerLayoutHeightContext);
}
