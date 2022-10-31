import { useEffect, useState } from "react";
import { BreakpointKey, Breakpoints } from "../Css";

/**
 * A React hook to return a record of responsive breakpoints that updates on resize.
 *
 * @example
 * const { breakpoints } = useBreakpoint();
 * if(breakpoints.mdAndDown) {...do something cool}
 */

type BreakpointsType = Partial<Record<BreakpointKey, boolean>>;

export function useBreakpoint(): { breakpoints: BreakpointsType } {
  const [breakpoints, setBreakpoints] = useState(matchMediaBreakpoints());

  useEffect(() => {
    function handleResize() {
      // Set breakpoints on resize
      setBreakpoints(matchMediaBreakpoints());
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { breakpoints };
}

function matchMediaBreakpoints(): BreakpointsType {
  let bps = {} as BreakpointsType;
  Object.entries(Breakpoints).forEach(([name, bp]) => {
    bps[name as keyof BreakpointsType] = window.matchMedia(bp.replace("@media ", "")).matches;
  });
  return bps;
}
