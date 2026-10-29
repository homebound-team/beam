/** Fixed document-scroll detail pane width (px). */
export const defaultDocumentScrollRightPaneWidth = 448;

/**
 * Minimum content-column width (px) on `md+` while the pane is open — form shell or table body.
 * Published as `--beam-right-pane-content-min` (not overlay `main`) so JumpLinks sit outside the floor.
 */
export const minDocumentScrollContentWidthPx = 480;

/** Opt into the document-scroll detail pane. Width is fixed at {@link defaultDocumentScrollRightPaneWidth}px. */
export type WithRightPane = boolean;
