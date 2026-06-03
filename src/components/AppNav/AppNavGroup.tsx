import { useResizeObserver } from "@react-aria/utils";
import { camelCase, kebabCase } from "change-case";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppNavGroupTrigger } from "src/components/AppNav/AppNavGroupTrigger";
import { AppNavItems } from "src/components/AppNav/AppNavItems";
import type { AppNavGroup } from "src/components/AppNav/appNavTypes";
import { appNavLinkGroupLinks } from "src/components/AppNav/appNavUtils";
import { useAppNavGroupExpanded } from "src/components/AppNav/useAppNavGroupExpanded";
import { NavLink } from "src/components/NavLinks";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type AppNavGroupViewProps = {
  linkGroup: AppNavGroup;
  panelCollapsed: boolean;
};

export function AppNavGroupView(props: AppNavGroupViewProps) {
  const { linkGroup, panelCollapsed } = props;
  const tid = useTestIds(props, "linkGroup");

  // When the side-nav panel is collapsed, flatten the list of links and render them as icon-only rows.
  // If not all links have icons, then this render is short-circuited upstream and will not get to this component
  if (panelCollapsed) {
    return (
      <>
        {appNavLinkGroupLinks(linkGroup).map((link) => (
          <NavLink
            key={link.label}
            variant="side"
            {...link}
            iconOnly={!!link.icon}
            {...tid[`link_${camelCase(link.label)}`]}
          />
        ))}
      </>
    );
  }

  return <AppNavGroupDisclosure {...props} />;
}

function AppNavGroupDisclosure(props: AppNavGroupViewProps) {
  const { linkGroup } = props;
  const { expanded, onToggle } = useAppNavGroupExpanded(linkGroup);
  const tid = useTestIds(props, "linkGroup");
  const navGroupId = `nav-group-${kebabCase(linkGroup.label)}`;

  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
  const contentRef = useMemo(() => ({ current: contentEl }), [contentEl]);
  const [contentHeight, setContentHeight] = useState<string>(expanded ? "auto" : "0");

  useEffect(() => {
    setContentHeight(expanded && contentEl ? `${contentEl.scrollHeight}px` : "0");
  }, [expanded, contentEl]);

  const onResize = useCallback(() => {
    if (contentEl && expanded) {
      setContentHeight(`${contentEl.scrollHeight}px`);
    }
  }, [expanded, contentEl]);
  useResizeObserver({ ref: contentRef, onResize });

  return (
    <div css={Css.df.fdc.$} {...tid}>
      <AppNavGroupTrigger
        label={linkGroup.label}
        navGroupId={navGroupId}
        expanded={expanded}
        onClick={onToggle}
        {...tid}
      />
      <div
        id={navGroupId}
        role="region"
        aria-hidden={!expanded}
        css={Css.oh.transitionHeight.h(contentHeight).$}
        {...tid.panel}
      >
        <div ref={setContentEl} css={Css.df.fdc.pl2.$}>
          <AppNavItems items={linkGroup.items} panelCollapsed={false} {...tid} />
        </div>
      </div>
    </div>
  );
}
