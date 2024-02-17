import equal from "fast-deep-equal";
import { useEffect, useState } from "react";
import { safeEntries } from "src/utils/index";
import { useDebouncedCallback } from "use-debounce";
import { Breakpoint, Breakpoints } from "../Css";

type BreakpointsType = Record<Breakpoint, boolean>;

/**
 * A React hook to return a record of responsive breakpoints that updates on resize.
 *
 * @example
 * const breakpoints = useBreakpoint();
 * if (breakpoints.mdAndDown) { ...do something cool }
 */
export function useBreakpoint(): BreakpointsType {
  const [breakpoints, setBreakpoints] = useState(matchMediaBreakpoints());

  const handleResize = useDebouncedCallback(() => {
    const newBps = matchMediaBreakpoints();
    if (equal(breakpoints, newBps)) return;

    setBreakpoints(newBps);
  }, 250);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return breakpoints;
}

function matchMediaBreakpoints(): BreakpointsType {
  const bps = {} as BreakpointsType;
  safeEntries(Breakpoints).forEach(([name, bp]) => {
    bps[name] = window.matchMedia(bp.replace("@media ", "")).matches;
  });
  return bps;
}
