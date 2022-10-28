import { useEffect, useState } from "react";

// this will be exported from truss soon
type BreakpointKey = "print" | "sm" | "md" | "smOrMd" | "mdAndUp" | "mdAndDown" | "lg" | "mdOrLg";
enum Breakpoints {
  print = "@media print",
  sm = "@media screen and (max-width:599px)",
  md = "@media screen and (min-width:600px) and (max-width:1024px)",
  smOrMd = "@media screen and (max-width:1024px)",
  mdAndUp = "@media screen and (min-width:600px)",
  mdAndDown = "@media screen and (max-width:1024px)",
  lg = "@media screen and (min-width:1025px)",
  mdOrLg = "@media screen and (min-width:600px)",
}

type BreakpointsType = Record<BreakpointKey, boolean>;

/**
 * A React hook to return a record of responsive breakpoints that updates on resize.
 *
 * @example
 * const { breakpoints } = useBreakpoint();
 * if(breakpoints.mdAndDown) {...do something cool}
 */

export function useBreakpoint(): { breakpoints: BreakpointsType } {
  const [breakpoints, setBreakpoints] = useState({} as BreakpointsType);

  useEffect(() => {
    function handleResize() {
      // Set breakpoints on resize
      let bps = {} as BreakpointsType;
      Object.entries(Breakpoints).forEach(([name, bp]) => {
        bps[name as keyof BreakpointsType] = window.matchMedia(bp.replace("@media screen and ", "")).matches;
      });
      setBreakpoints(bps);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { breakpoints };
}
