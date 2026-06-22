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

/** Table actions toolbar height (px) while pinned in document-scroll layouts. */
export const beamTableActionsHeightVar = "--beam-table-actions-height";

/** `left` for document-scroll sticky chrome (below side nav when present). */
export function documentScrollChromeLeft(): string {
  return `var(${beamSideNavLayoutWidthVar}, 0px)`;
}

/** `width` for document-scroll sticky chrome spanning the visible viewport beside the side nav. */
export function documentScrollChromeWidth(): string {
  return `calc(var(${beamLayoutViewportWidthVar}, 100vw) - var(${beamSideNavLayoutWidthVar}, 0px))`;
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
