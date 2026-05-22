import { NavLink } from "src/components/NavLinks";
import { SideNavLinkGroupView } from "src/components/SideNav/SideNavLinkGroup";
import { SideNavSectionView } from "src/components/SideNav/SideNavSectionView";
import type { SideNavItem } from "src/components/SideNav/sideNavTypes";
import { isSideNavLink, isSideNavLinkGroup, sideNavItemKey } from "src/components/SideNav/sideNavUtils";
import { useTestIds } from "src/utils";

export type SideNavItemsProps = {
  items: SideNavItem[];
  panelCollapsed: boolean;
};

export function SideNavItems(props: SideNavItemsProps) {
  const { items, panelCollapsed } = props;
  const tid = useTestIds(props, "sideNav");

  return (
    <>
      {items.map((item, idx) => {
        if (isSideNavLink(item)) {
          return (
            <NavLink
              key={sideNavItemKey(item)}
              variant="side"
              {...item}
              iconOnly={panelCollapsed && !!item.icon}
              {...tid.link}
            />
          );
        }
        if (isSideNavLinkGroup(item)) {
          return (
            <SideNavLinkGroupView
              key={sideNavItemKey(item)}
              linkGroup={item}
              panelCollapsed={panelCollapsed}
              {...tid.linkGroup}
            />
          );
        }
        return (
          <SideNavSectionView
            key={sideNavItemKey(item)}
            section={item}
            panelCollapsed={panelCollapsed}
            showDivider={idx < items.length - 1}
            {...tid.section}
          />
        );
      })}
    </>
  );
}
