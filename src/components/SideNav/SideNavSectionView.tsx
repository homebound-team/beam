import { SideNavItems } from "src/components/SideNav/SideNavItems";
import type { SideNavSection } from "src/components/SideNav/sideNavTypes";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type SideNavSectionViewProps = {
  section: SideNavSection;
  panelCollapsed: boolean;
  showDivider: boolean;
};

export function SideNavSectionView(props: SideNavSectionViewProps) {
  const { section, panelCollapsed, showDivider, ...scopeProps } = props;
  const tid = useTestIds(scopeProps);

  return (
    <div css={Css.df.fdc.pt2.if(showDivider).bb.bc(Tokens.SurfaceSeparator).pb2.$} {...tid}>
      {section.label && !panelCollapsed && (
        <div css={Css.xs2Sb.color(Tokens.OnSurface).px1.pb1.ttu.$} {...tid.label}>
          {section.label}
        </div>
      )}
      <SideNavItems {...scopeProps} items={section.items} panelCollapsed={panelCollapsed} />
    </div>
  );
}
