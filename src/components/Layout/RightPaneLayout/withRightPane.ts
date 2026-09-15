/** Default document-scroll detail pane width (px). */
export const defaultDocumentScrollRightPaneWidth = 450;

/**
 * Minimum content-column width (px) on `md+` while the pane is open — form shell or table body.
 * Published as `--beam-right-pane-content-min` (not overlay `main`) so JumpLinks sit outside the floor.
 */
export const minDocumentScrollContentWidthPx = 480;

/**
 * Opt into a document-scroll right pane. `true` uses the default width; a number or
 * `{ width? }` sets the pane width in px (`width` omitted → default).
 */
export type WithRightPane = boolean | number | { width?: number };

export type ResolvedWithRightPane = {
  width: number;
};

/** Normalize `withRightPane` into a pane width, or `undefined` when opted out. */
export function resolveWithRightPaneOptions(
  withRightPane: WithRightPane | undefined,
): ResolvedWithRightPane | undefined {
  if (withRightPane === undefined || withRightPane === false) return undefined;
  if (withRightPane === true) {
    return { width: defaultDocumentScrollRightPaneWidth };
  }
  if (typeof withRightPane === "number") {
    return { width: withRightPane };
  }
  return { width: withRightPane.width ?? defaultDocumentScrollRightPaneWidth };
}
