import { createContext, useContext } from "react";

export type OverlayHostContextValue = {
  registerOverlayHost: () => void;
  unregisterOverlayHost: () => void;
};

export const OverlayHostContext = createContext<OverlayHostContextValue | null>(null);

export function useOverlayHostContext(): OverlayHostContextValue {
  const context = useContext(OverlayHostContext);
  if (!context) {
    throw new Error("BeamOverlays must be rendered inside BeamProvider");
  }
  return context;
}
