import { NavGroupLink } from "src/components/NavLinks";

/** String labels only; see `NavGroupLink` / `NavLinkProps.label` (ReactNode) for the wider API. */
export type SideNavLink = NavGroupLink;

/** Collapsible labeled block of side-nav links (renders as an expandable disclosure). */
export type SideNavLinkGroup = {
  label: string;
  links: SideNavLink[];
  defaultExpanded?: boolean;
};

export type SideNavSectionItem = SideNavLink | SideNavLinkGroup;

/** Static section chrome (optional heading, divider) containing links, link groups, and/or nested sections. */
export type SideNavSection = {
  label?: string;
  items: SideNavItem[];
};

export type SideNavItem = SideNavLink | SideNavLinkGroup | SideNavSection;
