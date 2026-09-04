import { beamLayoutViewportWidthVar, beamSideNavLayoutWidthVar } from "src/layouts/layoutVars";
import {
  defaultDocumentScrollRightPaneWidth,
  DocumentScrollInlineRightPaneMode,
  DocumentScrollRightPaneMode,
  WithRightPane,
} from "./types";

/**
 * Desktop split-pane outcome (`md+` only). Internal — consumers pass
 * `DocumentScrollRightPaneMode` on `withRightPane`. See `docs/layouts.md`.
 * On `sm`, the pane is a full-bleed takeover ({@link DocumentScrollRightPane} `mobile`) — not a mode here.
 *
 * - `overlay` — main column stays full width; pane is fixed over the content.
 * - `push` — main column shrinks beside the pane.
 * - `clear` — main content unchanged; pane sits in the right gutter (negative margin on the pane).
 */
export type ResolvedDocumentScrollRightPaneBehavior = "overlay" | "push" | "clear";

export type ResolveDocumentScrollRightPaneBehaviorArgs = {
  mode: DocumentScrollInlineRightPaneMode;
  chromeWidthPx: number;
  paneWidthPx: number;
  /** Centered shell max-width for `auto` collision math. */
  shellMaxPx?: number;
  /** Reserved left rail (e.g. JumpLinks); defaults to 0. */
  jumpLinksWidthPx?: number;
};

export type ResolvedWithRightPane = {
  width: number;
  mode: DocumentScrollRightPaneMode;
};

/** Normalize `withRightPane` prop into width + mode, or `undefined` when opted out. */
export function resolveWithRightPaneOptions(
  withRightPane: WithRightPane | undefined,
  defaultMode: DocumentScrollRightPaneMode,
): ResolvedWithRightPane | undefined {
  if (withRightPane === undefined || withRightPane === false) return undefined;
  if (withRightPane === true) {
    return { width: defaultDocumentScrollRightPaneWidth, mode: defaultMode };
  }
  if (typeof withRightPane === "number") {
    return { width: withRightPane, mode: defaultMode };
  }
  return {
    width: withRightPane.width ?? defaultDocumentScrollRightPaneWidth,
    mode: withRightPane.mode ?? defaultMode,
  };
}

/** Maps consumer `mode` to inline desktop strategies (`overlay` is not valid on inline layouts). */
export function toInlineRightPaneMode(mode: DocumentScrollRightPaneMode): DocumentScrollInlineRightPaneMode {
  return mode === "push" ? "push" : "auto";
}

/** Resolve desktop split-pane behavior once when the pane opens (no resize re-evaluation). */
export function resolveDocumentScrollRightPaneBehavior(
  args: ResolveDocumentScrollRightPaneBehaviorArgs,
): ResolvedDocumentScrollRightPaneBehavior {
  const { mode, chromeWidthPx, paneWidthPx, shellMaxPx, jumpLinksWidthPx = 0 } = args;

  if (mode === "push") return "push";

  // auto — push or clear only (overlay mode uses DocumentScrollOverlayRightPaneLayout)
  if (shellMaxPx === undefined || chromeWidthPx <= 0) {
    return "push";
  }

  if (!centeredShellCollidesWithPane({ chromeWidthPx, paneWidthPx, shellMaxPx, jumpLinksWidthPx })) {
    return "clear";
  }

  // Colliding — narrow push when tight; never full-screen portal on md+
  return "push";
}

/** True when a centered shell (max `shellMaxPx`) would extend under a right-fixed pane. */
export function centeredShellCollidesWithPane(args: {
  chromeWidthPx: number;
  paneWidthPx: number;
  shellMaxPx: number;
  jumpLinksWidthPx?: number;
}): boolean {
  const { chromeWidthPx, paneWidthPx, shellMaxPx, jumpLinksWidthPx = 0 } = args;
  const availableColumn = contentColumnWidthPx(chromeWidthPx, shellMaxPx, jumpLinksWidthPx);
  const shellWidth = Math.min(shellMaxPx, availableColumn);
  const formLeft = jumpLinksWidthPx + (availableColumn - shellWidth) / 2;
  const formRight = formLeft + shellWidth;
  const paneLeft = chromeWidthPx - paneWidthPx;
  return formRight > paneLeft;
}

/**
 * Width left for the form after the JumpLinks rail and the `margin-right` that mirrors it — the JS
 * twin of `jumpLinksRailReservation`, so `auto` sees the same box the CSS lays out.
 */
function contentColumnWidthPx(rowWidthPx: number, shellMaxPx: number, jumpLinksWidthPx: number): number {
  const mirrorPx = clamp(0, rowWidthPx - shellMaxPx - jumpLinksWidthPx, jumpLinksWidthPx);
  return Math.max(0, rowWidthPx - jumpLinksWidthPx - mirrorPx);
}

function clamp(min: number, preferred: number, max: number): number {
  return Math.max(min, Math.min(preferred, max));
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
