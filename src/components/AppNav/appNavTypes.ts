import type { NavLinkProps } from "src/components/NavLinks";

/** A single nav link. String `label` only; see `NavLinkProps.label` (ReactNode) for the wider API. */
export type AppNavLink = Pick<NavLinkProps, "icon" | "onClick" | "active" | "disabled" | "openInNew" | "iconOnly"> & {
  label: string;
};

/**
 * Collapsible labeled block of nav links (side-nav disclosure or global-nav menu trigger).
 * Use unlabeled {@link AppNavSection} children to group menu rows with dividers.
 * Differs from AppNavSection in that AppNavGroup can be collapsed/expanded, and there is no visually distinct separation
 */
export type AppNavGroup = {
  label: string;
  items: AppNavItem[];
  defaultExpanded?: boolean;
};

export type AppNavSectionItem = AppNavLink | AppNavGroup;

/** Static section chrome (optional heading, divider) containing links, link groups, and/or nested sections.
 * Used to group links into visually distinct sections.
 * Differs from AppNavGroup in that it cannot be collapsed/expanded
 */
export type AppNavSection = {
  /** Discriminant — distinguishes sections from {@link AppNavGroup} (both use `items`). */
  section: true;
  label?: string;
  items: AppNavItem[];
};

export type AppNavItem = AppNavLink | AppNavGroup | AppNavSection;
