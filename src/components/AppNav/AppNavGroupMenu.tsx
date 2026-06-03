import type { AppNavGroup } from "src/components/AppNav/appNavTypes";
import { linkGroupHasActiveLink, linkGroupToMenuItems } from "src/components/AppNav/appNavUtils";
import { ButtonMenu } from "src/components/ButtonMenu";

/** Renders an {@link AppNavGroup} as a global-nav dropdown menu (desktop toolbar). */
export function AppNavGroupMenu({
  linkGroup,
  ...tid
}: {
  linkGroup: AppNavGroup;
} & Record<string, unknown>) {
  return (
    <ButtonMenu
      trigger={{
        navLabel: linkGroup.label,
        variant: "global",
        active: linkGroupHasActiveLink(linkGroup),
      }}
      items={linkGroupToMenuItems(linkGroup)}
      defaultOpen={linkGroup.defaultExpanded}
      {...tid}
    />
  );
}
