import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavSection } from "src/components/AppNav/appNavTypes";
import type { NavLinkVariant } from "src/components/NavLinks";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AppNavSectionViewProps = {
  section: AppNavSection;
  variant?: NavLinkVariant;
  panelCollapsed: boolean;
  showDivider: boolean;
  /** True when this section is inside an {@link AppNavGroup} disclosure. */
  nested?: boolean;
};

export function AppNavSectionView(props: AppNavSectionViewProps) {
  const { section, variant, panelCollapsed, nested = false, showDivider, ...scopeProps } = props;
  const tid = useTestIds(scopeProps);

  // if variant is global, will have right border divider and hide the section label
  const dividerStyles =
    variant === "global" ? Css.pr1.br.bc(Tokens.SurfaceSeparator).$ : Css.pbPx(4).bb.bc(Tokens.SurfaceSeparator).$;

  return (
    <div
      css={{
        ...Css.df.fdc.ptPx(4).$,
        ...(showDivider ? dividerStyles : {}),
      }}
      {...tid}
    >
      {section.label && !panelCollapsed && variant !== "global" && (
        <div css={Css.xs2Sb.color(Tokens.OnSurface).px1.py1.ttu.$} {...tid.label}>
          {section.label}
        </div>
      )}
      <AppNavItems
        {...scopeProps}
        items={section.items}
        variant={variant}
        panelCollapsed={panelCollapsed}
        nested={nested}
      />
    </div>
  );
}
