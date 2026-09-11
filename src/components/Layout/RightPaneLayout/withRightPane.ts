import { beamLayoutViewportWidthVar, beamSideNavLayoutWidthVar } from "src/layouts/layoutVars";

/** Whether the overlay host inserts a horizontal-scroll spacer while the pane is open. */
export type ReserveScroll = boolean | "auto";

/** Default document-scroll detail pane width (px). */
export const defaultDocumentScrollRightPaneWidth = 450;

/**
 * Minimum leftover chrome (px) for `reserveScroll: "auto"` to consider a spacer.
 * Below this the leftover column is unusable, so the pane overlays with no spacer.
 */
export const minDocumentScrollMainWidthPx = 480;

/**
 * Opt into a document-scroll right pane. `true` / a px width use the caller's default
 * `reserveScroll` (`true` for tables, `"auto"` for forms).
 */
export type WithRightPane =
  | boolean
  | number
  | {
      width?: number;
      reserveScroll?: ReserveScroll;
    };

export type ResolvedWithRightPane = {
  width: number;
  reserveScroll: ReserveScroll;
};

export type ResolveReserveScrollArgs = {
  reserveScroll: ReserveScroll;
  chromeWidthPx: number;
  paneWidthPx: number;
};

/** Normalize `withRightPane` into width + reserveScroll, or `undefined` when opted out. */
export function resolveWithRightPaneOptions(
  withRightPane: WithRightPane | undefined,
  defaultReserveScroll: ReserveScroll,
): ResolvedWithRightPane | undefined {
  if (withRightPane === undefined || withRightPane === false) return undefined;
  if (withRightPane === true) {
    return { width: defaultDocumentScrollRightPaneWidth, reserveScroll: defaultReserveScroll };
  }
  if (typeof withRightPane === "number") {
    return { width: withRightPane, reserveScroll: defaultReserveScroll };
  }
  return {
    width: withRightPane.width ?? defaultDocumentScrollRightPaneWidth,
    reserveScroll: withRightPane.reserveScroll ?? defaultReserveScroll,
  };
}

/** Resolve whether to insert the overlay spacer (tables always; forms when leftover chrome is usable). */
export function resolveReserveScroll(args: ResolveReserveScrollArgs): boolean {
  const { reserveScroll, chromeWidthPx, paneWidthPx } = args;
  if (reserveScroll === true) return true;
  if (reserveScroll === false) return false;
  if (chromeWidthPx <= 0) return false;
  const leftoverPx = chromeWidthPx - Math.min(paneWidthPx, chromeWidthPx);
  return leftoverPx >= minDocumentScrollMainWidthPx;
}

/**
 * Overlay spacer width (px). Tables always use the pane width. `auto` uses the pane width when
 * leftover chrome is usable so the form column is the leftover (fully visible); otherwise 0.
 */
export function resolveOverlaySpacerWidthPx(args: {
  reserveScroll: ReserveScroll;
  chromeWidthPx: number;
  paneWidthPx: number;
}): number {
  const { reserveScroll, chromeWidthPx, paneWidthPx } = args;
  if (reserveScroll === true) return chromeWidthPx > 0 ? Math.min(paneWidthPx, chromeWidthPx) : paneWidthPx;
  if (reserveScroll === false) return 0;
  if (!resolveReserveScroll({ reserveScroll, chromeWidthPx, paneWidthPx })) return 0;
  return chromeWidthPx > 0 ? Math.min(paneWidthPx, chromeWidthPx) : paneWidthPx;
}

/** Reads inherited chrome width (viewport − side nav) from CSS vars on `el`, falling back to `window`. */
export function readDocumentScrollChromeWidthPx(el: Element | null): number {
  if (typeof window === "undefined") return 0;
  if (!el) return window.innerWidth;
  const styles = getComputedStyle(el);
  const viewport = parseFloat(styles.getPropertyValue(beamLayoutViewportWidthVar)) || window.innerWidth;
  const sideNav = parseFloat(styles.getPropertyValue(beamSideNavLayoutWidthVar)) || 0;
  return Math.max(0, viewport - sideNav);
}
