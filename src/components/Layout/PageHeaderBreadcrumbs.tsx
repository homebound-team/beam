import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type HeaderBreadcrumb = {
  href: string;
  label: string;
};

export function PageHeaderBreadcrumbs({ breadcrumb }: { breadcrumb: HeaderBreadcrumb | HeaderBreadcrumb[] }) {
  const tids = useTestIds({}, "pageHeaderBreadcrumbs");

  const breadcrumbs = Array.isArray(breadcrumb) ? breadcrumb : [breadcrumb];

  return (
    <div css={Css.df.aic.mbPx(4).$} {...tids}>
      {breadcrumbs.map((breadcrumb, i) => (
        <Fragment key={`bc-${breadcrumb.label}`}>
          {i > 0 && <span css={Css.smSb.gray700.mr1.ml1.$}>/</span>}
          <Link to={breadcrumb.href} css={Css.smSb.gray700.onHover.gray900.$} className="navLink" {...tids.navLink}>
            {breadcrumb.label}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}
