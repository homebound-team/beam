import type { Meta } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { TabContent, type TabWithContent } from "src/components/Tabs";
import { Css } from "src/Css";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { GridTableLayoutExample } from "src/utils/sbComponents";

export default {
  component: PageHeaderLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

/** Header tabs, with the default tab rendering a `GridTableLayout` (its actions own the top gap). */
export function WithTabs() {
  const [selected, setSelected] = useState<PageTab>("lineItems");
  const tabs = useMemo(() => pageTabs(), []);

  return (
    <PageHeaderLayout
      pageHeader={{
        title: "Projects",
        rightSlot: <Button label="Action" onClick={() => {}} />,
        tabs: { tabs, selected, onChange: setSelected },
      }}
    >
      <TabContent tabs={tabs} selected={selected} />
    </PageHeaderLayout>
  );
}

/** The header auto-hides on scroll-down and reveals on scroll-up (tall body to demonstrate). */
export function Default() {
  return (
    <PageHeaderLayout pageHeader={{ title: "Page title", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
      <Body />
    </PageHeaderLayout>
  );
}

type PageTab = "lineItems" | "overview";

function pageTabs(): TabWithContent<PageTab>[] {
  return [
    {
      name: "Line items",
      value: "lineItems",
      render: () => <GridTableLayoutExample storageKey="page-header-layout-tabs" />,
    },
    {
      name: "Overview",
      value: "overview",
      render: () => (
        <div css={{ ...pageContentPaddingX, ...Css.pb2.$ }}>
          <p>Overview content sits below the tabs with the tab panel's own top gap.</p>
        </div>
      ),
    },
  ];
}

function Body() {
  return (
    <div css={{ ...pageContentPaddingX, ...Css.pb2.$ }}>
      {zeroTo(30).map((i) => (
        <p key={i} css={Css.mb3.$}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Section {i + 1}.
        </p>
      ))}
    </div>
  );
}
