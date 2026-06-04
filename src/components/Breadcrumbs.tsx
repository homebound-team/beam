import { Fragment, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Css } from "src/Css";
import { Icon } from "src/components/Icon";
import { useTestIds } from "src/utils";

export type Breadcrumb = {
  label: string;
  href: string;
  right?: ReactNode;
};

export interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb | Breadcrumb[];
  collapsible?: boolean;
}

export function Breadcrumbs({ breadcrumbs, collapsible }: BreadcrumbsProps) {
  const tid = useTestIds({}, "breadcrumb");
  const breadCrumbsInner = useMemo(() => (Array.isArray(breadcrumbs) ? breadcrumbs : [breadcrumbs]), [breadcrumbs]);
  const [collapsed, setCollapsed] = useState(breadCrumbsInner.length > 3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (breadCrumbsInner.length <= 0 || !collapsible || collapsed) return;
    // Collapse when clicking outside of the container
    const onClick = (e: MouseEvent) =>
      containerRef.current && !containerRef.current.contains(e.target as Node) && setCollapsed(true);
    document.addEventListener("mousedown", onClick);
    // Cleanup the event listener on component unmount
    return () => document.removeEventListener("mousedown", onClick);
  }, [collapsed, collapsible, setCollapsed, breadCrumbsInner]);

  const renderBreadcrumb = (bc: Breadcrumb, i: number, hideDivisor?: boolean) => (
    <Fragment key={`${bc.label}-${i}`}>
      {i > 0 &&
        !hideDivisor &&
        (collapsible ? (
          <span css={Css.gray700.pxPx(4).$}>/</span>
        ) : (
          <span css={Css.mr1.ml1.$}>
            <Icon icon="chevronRight" />
          </span>
        ))}
      <Link {...tid.link} to={bc.href} css={{ ...Css.xs.gray700.onHover.gray800.$ }} className="navLink">
        {bc.label}
      </Link>
      {bc.right}
    </Fragment>
  );

  return (
    <div ref={containerRef} css={Css.df.aic.mbPx(4).$}>
      {breadCrumbsInner.length > 3 && collapsed ? (
        <>
          {renderBreadcrumb(breadCrumbsInner[0], 0)}
          <button {...tid.expand} css={Css.gray700.pxPx(8).$} onClick={() => setCollapsed(false)}>
            ...
          </button>
          {renderBreadcrumb(breadCrumbsInner[breadCrumbsInner.length - 2], breadCrumbsInner.length - 2, true)}
          {renderBreadcrumb(breadCrumbsInner[breadCrumbsInner.length - 1], breadCrumbsInner.length - 1)}
        </>
      ) : (
        breadCrumbsInner.map((bc, i) => renderBreadcrumb(bc, i))
      )}
    </div>
  );
}
