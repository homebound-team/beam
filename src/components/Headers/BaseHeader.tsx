import { ReactNode } from "react";
import { Breadcrumbs, BreadcrumbsProps } from "src/components/Breadcrumbs";
import { Css, Tokens } from "src/Css";
import { useDocumentTitle } from "src/hooks/useDocumentTitle";
import { useTestIds } from "src/utils";

export type BaseHeaderProps = {
  title: string;
  /** Extra segment(s) for `document.title` only; not shown in the visible page heading. */
  documentTitleSuffix?: string;
  rightSlot?: ReactNode;
  breadcrumbs?: BreadcrumbsProps;
  bottomSlot?: ReactNode;
};

export function BaseHeader(props: BaseHeaderProps) {
  const { title, documentTitleSuffix, rightSlot, breadcrumbs, bottomSlot, ...otherProps } = props;
  const tid = useTestIds(otherProps, "header");
  useDocumentTitle(title, documentTitleSuffix);

  return (
    <header {...tid} css={Css.df.fdc.pt3.bb.gap2.bc(Tokens.SurfaceSeparator).bgColor(Tokens.Surface).$}>
      <div
        css={{
          ...Css.df.jcsb.w100.gap1.px3.$,
          ...Css.if(!bottomSlot).mb2.$,
        }}
      >
        <div css={Css.mw0.$}>
          {breadcrumbs && <Breadcrumbs {...breadcrumbs} />}
          <h1 {...tid.title} css={Css.xl.$}>
            {title}
          </h1>
        </div>
        <div css={Css.fs0.$}>{rightSlot}</div>
      </div>
      {bottomSlot}
    </header>
  );
}
