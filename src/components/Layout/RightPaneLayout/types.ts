/** Desktop layout strategy for the document-scroll right pane. See `docs/layouts.md`. */
export type DocumentScrollRightPaneMode = "auto" | "overlay" | "push";

/** Default document-scroll detail pane width (px). */
export const defaultDocumentScrollRightPaneWidth = 450;

/**
 * Opt into `DocumentScrollRightPaneLayout`.
 * `true` / a px width use the caller's default mode; an object sets width and/or mode.
 */
export type WithRightPane =
  | boolean
  | number
  | {
      width?: number;
      mode?: DocumentScrollRightPaneMode;
    };
