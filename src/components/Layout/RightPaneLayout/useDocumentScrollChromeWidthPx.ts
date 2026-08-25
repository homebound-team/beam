import { RefObject, useLayoutEffect, useState } from "react";
import { beamLayoutViewportWidthVar, beamSideNavLayoutWidthVar } from "src/layouts/layoutVars";

/** Reads inherited chrome width (viewport − side nav) from CSS vars on `el`, falling back to `window`. */
export function readDocumentScrollChromeWidthPx(el: Element | null): number {
  if (typeof window === "undefined") return 0;
  if (!el) return window.innerWidth;
  const styles = getComputedStyle(el);
  const viewport = parseFloat(styles.getPropertyValue(beamLayoutViewportWidthVar)) || window.innerWidth;
  const sideNav = parseFloat(styles.getPropertyValue(beamSideNavLayoutWidthVar)) || 0;
  return Math.max(0, viewport - sideNav);
}

/** Tracks document-scroll chrome width for `auto` / `push` layout math. */
export function useDocumentScrollChromeWidthPx(ref: RefObject<Element | null>): number {
  const [chromeWidthPx, setChromeWidthPx] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    const sync = () => setChromeWidthPx(readDocumentScrollChromeWidthPx(el));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [ref]);

  return chromeWidthPx;
}
