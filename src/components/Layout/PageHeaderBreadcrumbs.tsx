import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Css } from "src/Css";

export type HeaderBreadcrumb = {
  href: string;
  label: string;
};

export function PageHeaderBreadcrumbs({ breadcrumb }: { breadcrumb: HeaderBreadcrumb | HeaderBreadcrumb[] }) {
  const breadcrumbs = Array.isArray(breadcrumb) ? breadcrumb : [breadcrumb];

  return (
    <div css={Css.df.aic.mbPx(4).$}>
      {breadcrumbs.map((breadcrumb, i) => (
        <Fragment key={`bc-${breadcrumb.label}`}>
          {i > 0 && <span css={Css.smMd.gray700.mr1.ml1.$}>/</span>}
          <Link to={breadcrumb.href} css={Css.smMd.gray700.onHover.gray900.$} className="navLink">
            {breadcrumb.label}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}
