import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type Breadcrumb = {
  label: string;
  href: string;
};

export type BreadcrumbsProps = {
  breadcrumbs: Breadcrumb | Breadcrumb[];
};

export function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
  const tid = useTestIds({}, "breadcrumb");
  const items = Array.isArray(breadcrumbs) ? breadcrumbs : [breadcrumbs];

  return (
    <div css={Css.df.aic.gapPx(4).$}>
      {items.map((bc, i) => (
        <Fragment key={bc.label}>
          {i > 0 && <span css={Css.fs0.xs.$}>/</span>}
          <Link
            {...tid.link}
            to={bc.href}
            title={bc.label}
            css={Css.xs.gray900.truncate.mw0.maxwPx(120).onHover.gray800.$}
          >
            {bc.label}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}
