import { NavGroup, NavLink } from "src/components/NavLinks";
import type { SideNavLinkGroup } from "src/components/SideNav/sideNavTypes";
import { useSideNavLinkGroupExpanded } from "src/components/SideNav/useSideNavLinkGroupExpanded";
import { useTestIds } from "src/utils";

export type SideNavLinkGroupViewProps = {
  linkGroup: SideNavLinkGroup;
  panelCollapsed: boolean;
};

export function SideNavLinkGroupView(props: SideNavLinkGroupViewProps) {
  const { linkGroup, panelCollapsed } = props;
  const tid = useTestIds(props, "linkGroup");

  if (panelCollapsed) {
    return (
      <>
        {linkGroup.links.map((link) => (
          <NavLink key={link.label} variant="side" {...link} iconOnly={!!link.icon} {...tid.link} />
        ))}
      </>
    );
  }

  return <SideNavLinkGroupDisclosure {...props} />;
}

function SideNavLinkGroupDisclosure(props: SideNavLinkGroupViewProps) {
  const { linkGroup } = props;
  const { expanded, onToggle } = useSideNavLinkGroupExpanded(linkGroup);
  const tid = useTestIds(props, "linkGroup");

  return <NavGroup label={linkGroup.label} links={linkGroup.links} expanded={expanded} onClick={onToggle} {...tid} />;
}
