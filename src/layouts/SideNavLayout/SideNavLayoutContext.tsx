import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Breakpoints } from "src/Css";
import { useBreakpoint } from "src/hooks";

export type SideNavLayoutState = "hidden" | "collapse" | "expanded";

export type SideNavLayoutContextProps = {
  navState: SideNavLayoutState;
  setNavState: Dispatch<SetStateAction<SideNavLayoutState>>;
};

/**
 * localStorage key for persisting the user's open/closed choice across sessions.
 * Only "expanded" and "collapse" are written; "hidden" is treated as consumer-driven
 * (typically per-route) programmatic state, not a user toggle to remember.
 */
export const SIDE_NAV_LAYOUT_STATE_STORAGE_KEY = "beam.sideNavLayout.navState";

function loadStoredNavState(): SideNavLayoutState | undefined {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY) : null;
    return raw === "expanded" || raw === "collapse" ? raw : undefined;
  } catch {
    return undefined;
  }
}

/** Viewport below the `md` / `mdAndUp` threshold (< 600px). */
function isBelowMdBreakpoint(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia(Breakpoints.mdAndUp.replace("@media ", "")).matches;
}

/**
 * Initial nav state.
 * - Below `md`: `collapse` (icon strip), ignoring stored/desktop preference, unless the consumer
 *   passes an explicit `defaultNavState` (e.g. tests or programmatic `hidden`).
 * - `mdAndUp`: stored toggle → `defaultNavState` → `expanded`.
 */
function resolveInitialNavState(defaultNavState?: SideNavLayoutState): SideNavLayoutState {
  if (defaultNavState === "hidden") return "hidden";
  if (isBelowMdBreakpoint()) {
    if (defaultNavState !== undefined) return defaultNavState;
    return "collapse";
  }
  return loadStoredNavState() ?? defaultNavState ?? "expanded";
}

const SideNavLayoutContext = createContext<SideNavLayoutContextProps | undefined>(undefined);

export function SideNavLayoutProvider(props: { children: ReactNode; defaultNavState?: SideNavLayoutState }) {
  const [navState, setNavStateInternal] = useState<SideNavLayoutState>(() =>
    resolveInitialNavState(props.defaultNavState),
  );
  const bp = useBreakpoint();
  const prevMdAndUp = useRef(bp.mdAndUp);

  // When crossing from desktop → mobile, collapse an expanded rail (mobile starts icon-only).
  useEffect(() => {
    if (prevMdAndUp.current && !bp.mdAndUp) {
      setNavStateInternal((prev) => (prev === "expanded" ? "collapse" : prev));
    }
    prevMdAndUp.current = bp.mdAndUp;
  }, [bp.mdAndUp]);

  const setNavState: Dispatch<SetStateAction<SideNavLayoutState>> = useCallback((value) => {
    setNavStateInternal((prev) => {
      const next = typeof value === "function" ? (value as (p: SideNavLayoutState) => SideNavLayoutState)(prev) : value;
      if (next === "expanded" || next === "collapse") {
        try {
          window.localStorage.setItem(SIDE_NAV_LAYOUT_STATE_STORAGE_KEY, next);
        } catch {
          // localStorage may throw under quota / privacy mode; in-memory state still works.
        }
      }
      return next;
    });
  }, []);

  return (
    <SideNavLayoutContext.Provider value={{ navState, setNavState }}>{props.children}</SideNavLayoutContext.Provider>
  );
}

/**
 * Read the side-nav layout state.
 *
 * Defaults to `expanded` + a noop setter when called outside a provider, so pattern components
 * (e.g. `SideNav`) can render in isolation without crashing.
 */
export function useSideNavLayoutContext(): SideNavLayoutContextProps {
  return useContext(SideNavLayoutContext) ?? { navState: "expanded", setNavState: () => {} };
}

/** Internal: returns true if a `SideNavLayoutProvider` exists above. */
export function useHasSideNavLayoutProvider(): boolean {
  return useContext(SideNavLayoutContext) !== undefined;
}
