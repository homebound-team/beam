import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Breadcrumb } from "src/components/Breadcrumbs";
import { Button } from "src/components/Button";
import { PageHeader } from "src/components/PageHeader";
import { TabContent } from "src/components/Tabs";
import { testTabs } from "src/components/testData";
import { Css } from "src/Css";
import { withBeamDecorator, withRouter } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  component: PageHeader,
  parameters: {
    type: "figma",
    url: "https://www.figma.com/design/yJcdAYy1rqkxTTNhUQnjjU/H2-2026-Beam-Work?m=dev",
    layout: "fullscreen",
  },
  decorators: [withRouter(), withBeamDecorator],
} as Meta;

export function NoRightSlot() {
  return <PageHeader title="Test Title" />;
}

export function WithRightSlot() {
  return (
    <PageHeader
      title="Test Title"
      rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
    />
  );
}

export function WithTabs() {
  const [selected, setSelected] = useState(testTabs[0].value);

  return (
    <>
      <PageHeader
        title="Test Title"
        tabs={{
          tabs: testTabs,
          selected,
          onChange: setSelected,
        }}
      />
      <TabContent tabs={testTabs} selected={selected} />
    </>
  );
}

export function WithBreadcrumbs() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Test 1", href: "" },
    { label: "Test 2", href: "" },
    { label: "Test 3", href: "" },
  ];

  return (
    <PageHeader
      title="Test Title"
      breadcrumbs={{
        breadcrumbs: breadcrumbs,
      }}
    />
  );
}

export function WithRightSlotAndTabs() {
  const [selected, setSelected] = useState(testTabs[0].value);

  return (
    <>
      <PageHeader
        title="Test Title"
        rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
        tabs={{
          tabs: testTabs,
          selected,
          onChange: setSelected,
        }}
      />
      <TabContent tabs={testTabs} selected={selected} />
    </>
  );
}

export function WithRightSlotAndTabsAndBreadcrumbs() {
  const [selected, setSelected] = useState(testTabs[0].value);
  const breadcrumbs: Breadcrumb[] = [
    { label: "Test 1", href: "" },
    { label: "Test 2", href: "" },
    { label: "Test 3", href: "" },
  ];

  return (
    <>
      <PageHeader
        title="Test Title"
        breadcrumbs={{ breadcrumbs }}
        rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
        tabs={{
          tabs: testTabs,
          selected,
          onChange: setSelected,
        }}
      />
      <TabContent tabs={testTabs} selected={selected} />
    </>
  );
}

/** Toggle `collapsed` on/off to see the breadcrumbs/tabs collapse and title shrink animate. */
export function Collapsible() {
  const [selected, setSelected] = useState(testTabs[0].value);
  const [collapsed, setCollapsed] = useState(false);
  const breadcrumbs: Breadcrumb[] = [
    { label: "Test 1", href: "" },
    { label: "Test 2", href: "" },
    { label: "Test 3", href: "" },
  ];

  return (
    <>
      <div css={Css.p2.$}>
        <Button label={collapsed ? "Expand" : "Collapse"} onClick={() => setCollapsed(!collapsed)} />
      </div>
      {/* No tabs, for comparison against the tabbed header below — isolates whether tabs affect the animation. */}
      <div css={Css.df.fdc.gap1.$}>
        <PageHeader
          title="No Tabs"
          collapsed={collapsed}
          breadcrumbs={{ breadcrumbs }}
          rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
        />
        <PageHeader
          title="Test Title"
          collapsed={collapsed}
          breadcrumbs={{ breadcrumbs }}
          rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
          tabs={{
            tabs: testTabs,
            selected,
            onChange: setSelected,
          }}
        />
        <TabContent tabs={testTabs} selected={selected} />
      </div>
    </>
  );
}
