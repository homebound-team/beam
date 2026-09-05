import { defaultDocumentScrollRightPaneWidth, DocumentScrollRightPaneMode, WithRightPane } from "./types";

/** Desktop split-pane outcome (`md+` only). */
export type ResolvedDocumentScrollRightPaneBehavior = "overlay" | "push" | "clear";

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
