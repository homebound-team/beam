import { useLayoutEffect } from "react";
import { BeamColor } from "src/colors";
import { maybeCssVar } from "src/Css";

/** Sets `document.body` background color and restores the prior inline value on unmount. */
export function useBodyBackgroundColor(color: BeamColor): void {
  useLayoutEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const body = document.body;
    const previous = body.style.backgroundColor;
    body.style.backgroundColor = maybeCssVar(color);

    return () => {
      body.style.backgroundColor = previous;
    };
  }, [color]);
}
