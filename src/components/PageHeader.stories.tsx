import { Meta } from "@storybook/react-vite";
import { Button } from "src/components/Button";
import { PageHeader } from "src/components/PageHeader";
import { action } from "storybook/actions";

export default {
  component: PageHeader,
  parameters: {
    type: "figma",
    url: "https://www.figma.com/design/yJcdAYy1rqkxTTNhUQnjjU/H2-2026-Beam-Work?m=dev",
  },
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
