import { Fragment, useState } from "react";
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
  const [collapsed, setCollapsed] = useState(true);

  function renderBreadcrumb(bc: Breadcrumb, index: number) {
    return (
      // Index is added to the key to prevent rendering issues when multiple items have the same label
      <Fragment key={`${bc.label}-${index}`}>
        {index > 0 && <span css={Css.fs0.xs.$}>/</span>}
        <Link {...tid.link} to={bc.href} title={bc.label} css={Css.xs.gray900.onHover.gray600.$}>
          {bc.label}
        </Link>
      </Fragment>
    );
  }

  return (
    <div css={Css.df.aic.gapPx(4).$}>
      {items.length >= 3 && collapsed ? (
        <>
          {renderBreadcrumb(items[0], 0)}
          <span css={Css.fs0.xs.$}>/</span>
          <button {...tid.expand} css={Css.xs.gray900.onHover.gray600.$} onClick={() => setCollapsed(false)}>
            ...
          </button>
          {renderBreadcrumb(items[items.length - 1], items.length - 1)}
        </>
      ) : (
        items.map((bc, i) => renderBreadcrumb(bc, i))
      )}
    </div>
  );
}
