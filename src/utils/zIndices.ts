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

  // Page chrome.
  scrollShadow: 30,
  superDrawerScrim: 30,
  modalUnderlay: 40,
  pageStickyHeader: 50,

  dragHandle: 80,

  // Side-nav layer. Mobile rail overlays page content when expanded; sits below
  // snackbar so toasts still land on top.
  sideNav: 100,

  // Top of the stack.
  snackbar: 120,
} as const;

export type ZIndex = (typeof zIndices)[keyof typeof zIndices];
