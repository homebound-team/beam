/**
 * CSS custom property: effective navbar height (px) — the measured height while `NavbarLayout` pins it,
 * else `0`. Sticky offsets below the navbar read this so they collapse when it isn't pinned.
 */
export const beamNavbarLayoutHeightVar = "--beam-navbar-layout-height";

/**
 * CSS custom property: effective page header height (px) — the measured height while `PageHeaderLayout`
 * pins it, else `0`. Use for sticky offsets in the page body (e.g. sub-section headers below the header).
 */
export const beamPageHeaderLayoutHeightVar = "--beam-page-header-layout-height";

/**
 * CSS custom property: visible viewport width (px) — excludes the vertical scrollbar gutter. Use instead
 * of `100vw` when sizing sticky chrome so it doesn't extend under the scrollbar.
 */
export const beamLayoutViewportWidthVar = "--beam-layout-viewport-width";

/**
 * CSS custom property: visible viewport height (px) — excludes the horizontal scrollbar gutter. Use
 * instead of `100vh` when sizing sticky chrome so it doesn't extend under the scrollbar.
 */
export const beamLayoutViewportHeightVar = "--beam-layout-viewport-height";

/** CSS custom property: side nav rail width (px) for `SideNavLayout` + horizontal sticky offsets. */
export const beamSideNavLayoutWidthVar = "--beam-side-nav-layout-width";

/**
 * CSS `top` for chrome that must sit below the auto-hiding navbar **and** page header: the sum of
 * {@link beamNavbarLayoutHeightVar} + {@link beamPageHeaderLayoutHeightVar} (+ an optional base px). Each
 * var collapses to `0` when its chrome scrolls away. Used by `GridTable`'s sticky header.
 */
export function stickyNavAndHeaderOffset(basePx = 0): string {
  return `calc(${basePx}px + var(${beamNavbarLayoutHeightVar}, 0px) + var(${beamPageHeaderLayoutHeightVar}, 0px))`;
}
