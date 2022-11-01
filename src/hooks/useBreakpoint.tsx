import equal from "fast-deep-equal";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { BreakpointKey, Breakpoints } from "../Css";

/**
 * A React hook to return a record of responsive breakpoints that updates on resize.
 *
 * @example
 * const { breakpoints } = useBreakpoint();
 * if(breakpoints.mdAndDown) {...do something cool}
 */

type BreakpointsType = Record<BreakpointKey, boolean>;

export const useBreakpoint = (): BreakpointsType => {
  const [breakpoints, setBreakpoints] = useState(matchMediaBreakpoints());

  const handleResize = useDebouncedCallback(() => {
    const newBps = matchMediaBreakpoints();
    if (equal(breakpoints, newBps)) return;

    setBreakpoints(newBps);
  }, 1000);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoints;
};

function matchMediaBreakpoints(): BreakpointsType {
  let bps = {} as BreakpointsType;
  Object.entries(Breakpoints).forEach(([name, bp]) => {
    bps[name as keyof BreakpointsType] = window.matchMedia(bp.replace("@media ", "")).matches;
  });
  return bps;
}
