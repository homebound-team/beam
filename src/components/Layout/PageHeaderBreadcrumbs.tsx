import { Fragment, ReactNode, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type HeaderBreadcrumb = {
  href: string;
  label: string;
  right?: ReactNode;
};

type PageHeaderBreadcrumbsProps = {
  breadcrumb: HeaderBreadcrumb | HeaderBreadcrumb[];
};

export function PageHeaderBreadcrumbs({ breadcrumb }: PageHeaderBreadcrumbsProps) {
  const tids = useTestIds({}, "pageHeaderBreadcrumbs");
  const breadcrumbs = useMemo(() => (Array.isArray(breadcrumb) ? breadcrumb : [breadcrumb]), [breadcrumb]);
  const [collapsed, setCollapsed] = useState(true);

  function renderBreadcrumb(bc: HeaderBreadcrumb, index: number, hideDivisor?: boolean) {
    return (
      // Adding index to key to prevent rendering issues when multiple items have the same label
      <Fragment key={`${bc.label}-${index}`}>
        {index > 0 && !hideDivisor && <span css={Css.smSb.gray700.mx1.myPx(2).$}>/</span>}
        <Link to={bc.href} css={Css.smSb.gray700.onHover.gray900.$} className="navLink" {...tids.navLink}>
          {bc.label}
        </Link>
        {bc.right}
      </Fragment>
    );
  }

  return (
    <div css={Css.df.aic.mbPx(4).$}>
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
