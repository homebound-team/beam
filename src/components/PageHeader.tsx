import { ReactNode } from "react";
import { RouteTabsProps, Tabs, TabsProps } from "src/components/Tabs";
import { Css, Tokens } from "src/Css";
import { AnyObject } from "src/types";
import { useTestIds } from "src/utils";

export interface PageHeaderProps<V extends string> {
  title: ReactNode;
  rightSlot?: ReactNode;
  tabs?: TabsProps<V, AnyObject> | RouteTabsProps<V, AnyObject>;
}

export function PageHeader<V extends string>(props: PageHeaderProps<V>) {
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
