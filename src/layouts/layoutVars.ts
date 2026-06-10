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

/** `top` offset below auto-hiding navbar + page header (each var collapses to `0` when scrolled away). */
export function stickyNavAndHeaderOffset(basePx = 0): string {
  return `calc(${basePx}px + var(${beamNavbarLayoutHeightVar}, 0px) + var(${beamPageHeaderLayoutHeightVar}, 0px))`;
}
