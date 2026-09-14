/** Desktop right-pane strategy. See `docs/layouts.md` for overlay / push / auto outcomes. */
export type DocumentScrollRightPaneMode = "auto" | "overlay" | "push";

/** Desktop strategies for the upcoming inline (push/clear) pane only. */
export type DocumentScrollInlineRightPaneMode = "auto" | "push";

/** Default document-scroll detail pane width (px). */
export const defaultDocumentScrollRightPaneWidth = 450;

/**
 * Opt into a document-scroll right pane. `true` / a px width use the caller's default mode;
 * an object sets width and/or mode.
 */
export type WithRightPane =
  | boolean
  | number
  | {
      width?: number;
      mode?: DocumentScrollRightPaneMode;
    };

export type ResolvedWithRightPane = {
  width: number;
  mode: DocumentScrollRightPaneMode;
};

/** Desktop split-pane outcome (`md+` only). */
export type ResolvedDocumentScrollRightPaneBehavior = "overlay" | "push" | "clear";

/** Normalize `withRightPane` into width + mode, or `undefined` when opted out. */
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
