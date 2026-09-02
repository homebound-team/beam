/**
 * Cross-component z-index layers.
 *
 * Keep values sparse so new layers can slot between existing ones without ripple
 * edits. Lower numbers sit behind higher numbers in the same stacking context.
 *
 * Global overlays (Modal, SuperDrawer, Snackbar) must portal to `document.body`, otherwise an app
 * root that establishes a stacking context traps them below the layers listed here.
 */
export const zIndices = {
  // Local table stacking (single GridTable's internal stack only).
  tableExpandableIcon: 10,
  tableExpandableTitle: 20,
  tableStickyColumn: 30,
  tableStickyHeader: 40,
  tableActions: 45,

  // Document-scroll "back to top" — above inline page/table chrome, below every overlay scrim.
  scrollToTop: 50,

  // Page chrome - ensure these items sit above the table
  scrollShadow: 50,
  // Document-scroll detail pane (DocumentScrollRightPaneLayout) — above table sticky chrome, below page sticky headers.
  rightPane: 60,
  pageStickyHeader: 70,
  // Sticky mobile action footer (workflow layouts) — same tier as pageStickyHeader; header and footer never overlap on screen.
  pageStickyFooter: 70,

  dragHandle: 80,

  // Side-nav layer. Mobile rail overlays page content when expanded; sits below
  // snackbar so toasts still land on top.
  sideNav: 100,

  // App navbar (NavbarLayout) — above the side nav and page sticky headers; full-page overlays and
  // toasts still clear it.
  navbar: 120,

  // Navbar mobile drawer + scrim — above navbar; below environment banner.
  navbarMobileMenuScrim: 124,
  navbarMobileMenu: 125,

  // Document-scroll right pane on `sm` — full-bleed overlay below the env banner; covers navbar /
  // page chrome / table actions but must not paint over the banner.
  rightPaneMobile: 126,

  // Environment banner (EnvironmentBannerLayout) — above navbar mobile menu; below overlay scrims.
  environmentBanner: 130,

  // Overlay scrims — above app chrome (including the environment banner); modal above SuperDrawer
  // so ConfirmCloseModal can sit on top of an open drawer. Below pageOverlay / snackbar.
  superDrawerScrim: 140,
  modalUnderlay: 150,

  // Full-page overlays — high enough to clear consuming-app nav bars (~999).
  // Both layouts own their Toast internally so it renders inside the overlay header.
  pageOverlay: 1000,

  // Top of stack
  snackbar: 1100,
} as const;

export type ZIndex = (typeof zIndices)[keyof typeof zIndices];
