import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "src/components/Button";
import { PageHeader } from "src/components/PageHeader";
import { TabContent } from "src/components/Tabs";
import { testTabs } from "src/components/testData";
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
