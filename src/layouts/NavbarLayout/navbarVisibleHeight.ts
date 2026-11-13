/** Navbar height still on screen (px). Updated during scroll, before the page header reads its pin line. */
export function setNavbarVisibleHeight(heightPx: number): void {
  navbarVisibleHeightPx = heightPx;
}

/** Navbar height still on screen (px), including the value just written by the navbar's scroll listener. */
export function readNavbarVisibleHeight(): number {
  return navbarVisibleHeightPx;
}

// Written from the navbar's scroll listener so the page header reads the still-visible height in the same scroll.
let navbarVisibleHeightPx = 0;
