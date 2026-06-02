import { ReactNode, useState } from "react";
import { Tab, Tabs } from "src/components/Tabs";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export interface PageHeaderProps<V extends string> {
  title: ReactNode;
  rightSlot?: ReactNode;
  tabs?: Tab<V>[];
}

export function PageHeader<V extends string>(props: PageHeaderProps<V>) {
  const { title, rightSlot, tabs, ...otherProps } = props;
  const tid = useTestIds(otherProps, "pageHeader");
  const [selectedTab, setSelectedTab] = useState("tab1");

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
      {tabs && <Tabs tabs={tabs} selected={selectedTab} onChange={setSelectedTab} />}
    </header>
  );
}
