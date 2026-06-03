/**
 * Cross-component z-index layers.
 *
 * Keep values sparse so new layers can slot between existing ones without ripple
 * edits. Lower numbers sit behind higher numbers in the same stacking context.
 */
export const zIndices = {
  // Local table stacking (single GridTable's internal stack only).
  tableExpandableIcon: 10,
  tableExpandableTitle: 20,
  tableStickyColumn: 30,
  tableStickyHeader: 40,

  // Page chrome - ensure these items sit above the table
  scrollShadow: 50,
  superDrawerScrim: 50,
  modalUnderlay: 60,
  pageStickyHeader: 70,

  dragHandle: 80,

  // Side-nav layer. Mobile rail overlays page content when expanded; sits below
  // snackbar so toasts still land on top.
  sideNav: 100,

  // Full-page overlays sit above side-nav and use their own toast internally
  pageOverlay: 110,

  // Top of stack
  snackbar: 120,
} as const;

export type ZIndex = (typeof zIndices)[keyof typeof zIndices];
