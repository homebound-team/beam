import { ReactNode } from "react";
import { RouteTabsProps, Tabs, TabsContentXss, TabsProps } from "src/components/Tabs";
import { Css, Only, Tokens } from "src/Css";
import { useDocumentTitle } from "src/hooks/useDocumentTitle";
import { useTestIds } from "src/utils";

export type PageHeaderProps<V extends string, X> = {
  title: string;
  /** Extra segment(s) for `document.title` only; not shown in the visible page heading. */
  documentTitleSuffix?: string;
  rightSlot?: ReactNode;
  tabs?:
    | Omit<TabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">
    | Omit<RouteTabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">;
};

export function PageHeader<V extends string, X extends Only<TabsContentXss, X>>(props: PageHeaderProps<V, X>) {
  const { title, documentTitleSuffix, rightSlot, tabs, ...otherProps } = props;
  const tid = useTestIds(otherProps, "pageHeader");
  useDocumentTitle(title, documentTitleSuffix);

  return (
    <header {...tid} css={Css.df.fdc.pt3.pr3.pl3.bb.bc(Tokens.SurfaceSeparator).bgColor(Tokens.Surface).$}>
      <div css={Css.df.jcsb.mb2.w100.gap1.$}>
        <div>
          {/* Breadcrumbs here */}
          <h1 {...tid.title} css={Css.xl.$}>
            {title}
          </h1>
        </div>
        <div>{rightSlot}</div>
      </div>
      {tabs && <Tabs {...tabs} />}
    </header>
  );
}
