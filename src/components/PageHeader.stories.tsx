import { Meta } from "@storybook/react-vite";
import { Button } from "src/components/Button";
import { PageHeader } from "src/components/PageHeader";
import { testTabs } from "src/components/testData";
import { withBeamDecorator, withRouter } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  component: PageHeader,
  parameters: {
    type: "figma",
    url: "https://www.figma.com/design/yJcdAYy1rqkxTTNhUQnjjU/H2-2026-Beam-Work?m=dev",
  },
  decorators: [withRouter("/ce:2", "/:ceId/*"), withBeamDecorator],
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
  return <PageHeader title="Test Title" tabs={testTabs} />;
}

export function WithRightSlotAndTabs() {
  return (
    <PageHeader
      title="Test Title"
      rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
      tabs={testTabs}
    />
  );
}
