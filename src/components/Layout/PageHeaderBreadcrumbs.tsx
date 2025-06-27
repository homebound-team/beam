import { Fragment, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Css, Xss } from "src/Css";
import { useTestIds } from "src/utils";

export type HeaderBreadcrumb = {
  href: string;
  label: string;
  right?: ReactNode;
};

type PageHeaderBreadcrumbsProps = {
  breadcrumb: HeaderBreadcrumb | HeaderBreadcrumb[];
  linkXss?: Xss<"color" | "cursor">;
  collapsible?: boolean;
};

export function PageHeaderBreadcrumbs({ breadcrumb, linkXss, collapsible }: PageHeaderBreadcrumbsProps) {
  const tids = useTestIds({}, "pageHeaderBreadcrumbs");
  const breadcrumbs = useMemo(() => (Array.isArray(breadcrumb) ? breadcrumb : [breadcrumb]), [breadcrumb]);
  const [collapsed, setCollapsed] = useState(breadcrumbs.length > 3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (breadcrumbs.length === 0 || !collapsible || collapsed) return;
    // Collapse when clicking outside of the container
    const onClick = (e: MouseEvent) =>
      containerRef.current && !containerRef.current.contains(e.target as Node) && setCollapsed(true);
    document.addEventListener("mousedown", onClick);
    // Cleanup the event listener on component unmount
    return () => document.removeEventListener("mousedown", onClick);
  }, [collapsed, collapsible, setCollapsed, breadcrumbs]);

  const renderBreadcrumb = (bc: HeaderBreadcrumb, index: number, hideDivisor?: boolean) => (
    // Adding index to key to prevent rendering issues when multiple items have the same label
    <Fragment key={`${bc.label}-${index}`}>
      {index > 0 && !hideDivisor && <span css={Css.smMd.gray700.mx1.$}>/</span>}
      <Link
        {...tids.navLink}
        to={bc.href}
        css={{ ...Css.xsMd.gray700.addIn("&:hover", Css.gray800.$).$, ...linkXss }}
        className="navLink"
      >
        {bc.label}
      </Link>
      {bc.right}
    </Fragment>
  );

  return (
    <div ref={containerRef} css={Css.df.aic.mbPx(4).$}>
      {breadcrumbs.length > 3 && collapsed ? (
        <>
          {renderBreadcrumb(breadcrumbs[0], 0)}
          <button {...tids.expand} css={Css.gray700.pxPx(8).$} onClick={() => setCollapsed(false)}>
            ...
          </button>
          {renderBreadcrumb(breadcrumbs[breadcrumbs.length - 2], breadcrumbs.length - 2, true)}
          {renderBreadcrumb(breadcrumbs[breadcrumbs.length - 1], breadcrumbs.length - 1)}
        </>
      ) : (
        breadcrumbs.map((bc, i) => renderBreadcrumb(bc, i))
      )}
    </div>
  );
}
