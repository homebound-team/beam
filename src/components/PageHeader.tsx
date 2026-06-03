import { ReactNode } from "react";
import { RouteTabsProps, Tabs, TabsContentXss, TabsProps } from "src/components/Tabs";
import { Css, Only, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export interface PageHeaderProps<V extends string, X> {
  title: ReactNode;
  rightSlot?: ReactNode;
  tabs?:
    | Omit<TabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">
    | Omit<RouteTabsProps<V, X>, "contentXss" | "omitFullBleedPadding" | "includeBottomBorder">;
}

export function PageHeader<V extends string, X extends Only<TabsContentXss, X>>(props: PageHeaderProps<V, X>) {
  const { title, rightSlot, tabs, ...otherProps } = props;
  const tid = useTestIds(otherProps, "pageHeader");

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
