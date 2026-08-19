/** Effective environment banner height (px); `0` when hidden. */
export const beamEnvironmentBannerLayoutHeightVar = "--beam-environment-banner-height";

/** Effective navbar height (px) while pinned; `0` when scrolled away. */
export const beamNavbarLayoutHeightVar = "--beam-navbar-layout-height";

/** Effective page header height (px) while pinned; `0` when scrolled away. */
export const beamPageHeaderLayoutHeightVar = "--beam-page-header-layout-height";

/** Visible viewport width (px); use instead of `100vw` for sticky chrome. */
export const beamLayoutViewportWidthVar = "--beam-layout-viewport-width";

/** Visible viewport height (px); use instead of `100vh` for sticky chrome. */
export const beamLayoutViewportHeightVar = "--beam-layout-viewport-height";

/** Side nav rail width (px) for horizontal sticky offsets. */
export const beamSideNavLayoutWidthVar = "--beam-side-nav-layout-width";

/**
 * Horizontal inset from a padded ancestor (e.g. {@link CenteredLayout}). `0px` when unset.
 * `layoutContainer` subtracts this from chrome width and adds it to `left`.
 */
export const beamLayoutContentPaddingXVar = "--beam-layout-content-padding-x";

/** Table actions toolbar height (px) while pinned in document-scroll layouts. */
export const beamTableActionsHeightVar = "--beam-table-actions-height";

/**
 * Open document-scroll right pane width; `0px` when closed. Published on
 * `DocumentScrollRightPaneLayout` so sticky right columns (descendants) inherit it.
 * Not subtracted from `documentScrollChromeWidth` — the pane pins below page header /
 * table actions.
 */
export const beamRightPaneWidthVar = "--beam-right-pane-width";

/**
 * Extra `right` inset for floating page chrome when the document-scroll right pane is open.
 * Published on `document.documentElement` so siblings outside the pane layout (e.g.
 * `DocumentScrollToTopButton`) can clear the pane. Prefer this over reading
 * `beamRightPaneWidthVar` at the root.
 */
export const beamFloatingRightOffsetVar = "--beam-floating-right-offset";

/**
 * `WorkflowLayout`'s mobile action-footer height (px); `0px` when absent. Published directly on
 * `document.documentElement` (not via inline `style` on a React-tree wrapper) since consumers like
 * `DocumentScrollToTopButton` are siblings of `WorkflowLayout`'s subtree, not descendants.
 */
export const beamWorkflowLayoutFooterHeightVar = "--beam-workflow-layout-footer-height";

/** `left` for document-scroll sticky chrome (below side nav when present). */
export function documentScrollChromeLeft(): string {
  return `var(${beamSideNavLayoutWidthVar}, 0px)`;
}

/** `width` for document-scroll sticky chrome spanning the visible viewport beside the side nav. */
export function documentScrollChromeWidth(): string {
  return `calc(var(${beamLayoutViewportWidthVar}, 100vw) - var(${beamSideNavLayoutWidthVar}, 0px))`;
}

/** `left` for `layoutContainer` when inside a padded ancestor (e.g. {@link CenteredLayout}); chrome left when the padding var is unset. */
export function documentScrollContentLeft(): string {
  return `calc(${documentScrollChromeLeft()} + var(${beamLayoutContentPaddingXVar}, 0px))`;
}

/** `width` for `layoutContainer` when inside a padded ancestor (e.g. {@link CenteredLayout}); chrome width when the padding var is unset. */
export function documentScrollContentWidth(): string {
  return `calc(${documentScrollChromeWidth()} - 2 * var(${beamLayoutContentPaddingXVar}, 0px))`;
}

/** `height` for a fixed document-scroll right pane from the sticky table-header offset to the viewport bottom. */
export function documentScrollRightPaneHeight(): string {
  return `calc(var(${beamLayoutViewportHeightVar}, 100vh) - ${stickyTableHeaderOffset()})`;
}

/**
 * `width` for the document-scroll right pane: the configured max px, capped by available chrome
 * width so the pane fits the viewport on mobile (side nav collapses to `0px` there).
 */
export function documentScrollRightPaneWidth(maxPx: number): string {
  return `min(${maxPx}px, ${documentScrollChromeWidth()})`;
}

/** CSS `top` offset below the environment banner + auto-hiding navbar. */
export function bannerAndNavbarChromeTop(): string {
  return `calc(var(${beamEnvironmentBannerLayoutHeightVar}, 0px) + var(${beamNavbarLayoutHeightVar}, 0px))`;
}

/** `top` offset below environment banner + auto-hiding navbar + page header (each var collapses to `0` when scrolled away). */
export function stickyNavAndHeaderOffset(basePx = 0): string {
  return `calc(${basePx}px + var(${beamEnvironmentBannerLayoutHeightVar}, 0px) + var(${beamNavbarLayoutHeightVar}, 0px) + var(${beamPageHeaderLayoutHeightVar}, 0px))`;
}

/** `top` offset for sticky table column headers (environment banner + navbar + page header + table actions). */
export function stickyTableHeaderOffset(basePx = 0): string {
  return `calc(${basePx}px + var(${beamEnvironmentBannerLayoutHeightVar}, 0px) + var(${beamNavbarLayoutHeightVar}, 0px) + var(${beamPageHeaderLayoutHeightVar}, 0px) + var(${beamTableActionsHeightVar}, 0px))`;
}

/**
 * `bottom` offset for floating page chrome (e.g. `DocumentScrollToTopButton`) that must clear other
 * fixed-position bottom chrome — currently just `WorkflowLayout`'s mobile action footer, but stacks with
 * future bottom-anchored elements the same way. `basePx` is the element's own resting offset.
 */
export function getFloatingBottomOffset(basePx = 0): string {
  return `calc(${basePx}px + var(${beamWorkflowLayoutFooterHeightVar}, 0px))`;
}

/**
 * `right` offset for floating page chrome that must clear the open document-scroll right pane.
 * `basePx` is the element's own resting inset from the viewport edge.
 */
export function getFloatingRightOffset(basePx = 0): string {
  return `calc(${basePx}px + var(${beamFloatingRightOffsetVar}, 0px))`;
}

/** Page content horizontal inset (px).
 * Setting in layoutVars instead of layoutSpacing to avoid circular dependency with truss-config.ts
 */
export const pageContentPaddingXValue = "24px";
