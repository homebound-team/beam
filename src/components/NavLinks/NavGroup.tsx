import { useResizeObserver } from "@react-aria/utils";
import { kebabCase } from "change-case";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavGroupTrigger } from "src/components/NavLinks/NavGroupTrigger";
import { NavLink, NavLinkProps } from "src/components/NavLinks/NavLink";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

/** Side-nav link config; `label` is a string (NavLink itself still accepts ReactNode for other callers). */
export type NavGroupLink = Pick<NavLinkProps, "icon" | "onClick" | "active" | "disabled" | "openInNew"> & {
  label: string;
};

export type NavGroupProps = {
  label: string;
  links: NavGroupLink[];
  expanded: boolean;
  onClick: VoidFunction;
};

export function NavGroup(props: NavGroupProps) {
  const { label, links, expanded, onClick } = props;
  const tid = useTestIds(props, "navGroup");
  const navGroupId = `nav-group-${kebabCase(label)}`;

  // Measured-height panel animation (mirrors Accordion's mechanism, driven by Css.transitionHeight).
  // State-based ref so useResizeObserver re-subscribes when the panel content mounts/unmounts.
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
  const contentRef = useMemo(() => ({ current: contentEl }), [contentEl]);
  // Starts at "auto" when already expanded so the initial paint doesn't animate from 0.
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
      <NavGroupTrigger label={label} navGroupId={navGroupId} expanded={expanded} onClick={onClick} {...tid} />
      <div
        id={navGroupId}
        role="region"
        aria-hidden={!expanded}
        css={Css.oh.transitionHeight.h(contentHeight).$}
        {...tid.panel}
      >
        <div ref={setContentEl} css={Css.df.fdc.pl2.$}>
          {links.map((link) => {
            const linkKey = kebabCase(link.label);
            return <NavLink key={linkKey} variant="side" {...link} {...tid[`link_${linkKey}`]} />;
          })}
        </div>
      </div>
    </div>
  );
}
