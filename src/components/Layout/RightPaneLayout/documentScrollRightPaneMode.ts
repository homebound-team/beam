import { defaultDocumentScrollRightPaneWidth, DocumentScrollRightPaneMode, WithRightPane } from "./types";

/** Minimum main-column width (px) before `auto` falls back from `push` to `overlay`. */
export const defaultMinPushContentWidthPx = 460;

/** Effective desktop behavior after resolving `mode` (including `auto`). */
export type ResolvedDocumentScrollRightPaneBehavior = "overlay" | "push" | "clear";

export type ResolveDocumentScrollRightPaneBehaviorArgs = {
  mode: DocumentScrollRightPaneMode;
  chromeWidthPx: number;
  paneWidthPx: number;
  /** Centered shell max-width; required for meaningful `auto` (otherwise `auto` → `overlay`). */
  shellMaxPx?: number;
  /** Reserved left rail (e.g. JumpLinks); defaults to 0. */
  jumpLinksWidthPx?: number;
  minContentWidthPx?: number;
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

/**
 * Resolve desktop pane behavior. `overlay` always keeps under-pane content reachable via spacer.
 * `auto` may return `clear` (no spacer) only when the centered shell already clears the pane.
 */
export function resolveDocumentScrollRightPaneBehavior(
  args: ResolveDocumentScrollRightPaneBehaviorArgs,
): ResolvedDocumentScrollRightPaneBehavior {
  const {
    mode,
    chromeWidthPx,
    paneWidthPx,
    shellMaxPx,
    jumpLinksWidthPx = 0,
    minContentWidthPx = defaultMinPushContentWidthPx,
  } = args;

  if (mode === "overlay") return "overlay";
  if (mode === "push") return "push";

  // auto
  if (shellMaxPx === undefined || chromeWidthPx <= 0) return "overlay";

  if (!centeredShellCollidesWithPane({ chromeWidthPx, paneWidthPx, shellMaxPx, jumpLinksWidthPx })) {
    return "clear";
  }

  const remaining = chromeWidthPx - jumpLinksWidthPx - paneWidthPx;
  if (remaining >= minContentWidthPx) return "push";
  return "overlay";
}

/** True when a centered shell (max `shellMaxPx`) would extend under a right-fixed pane. */
export function centeredShellCollidesWithPane(args: {
  chromeWidthPx: number;
  paneWidthPx: number;
  shellMaxPx: number;
  jumpLinksWidthPx?: number;
}): boolean {
  const { chromeWidthPx, paneWidthPx, shellMaxPx, jumpLinksWidthPx = 0 } = args;
  const availableColumn = Math.max(0, chromeWidthPx - jumpLinksWidthPx);
  const shellWidth = Math.min(shellMaxPx, availableColumn);
  const formLeft = jumpLinksWidthPx + (availableColumn - shellWidth) / 2;
  const formRight = formLeft + shellWidth;
  const paneLeft = chromeWidthPx - paneWidthPx;
  return formRight > paneLeft;
}
