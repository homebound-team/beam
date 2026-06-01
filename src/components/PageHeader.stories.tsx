import { Meta } from "@storybook/react-vite";
import { Button } from "src/components/Button";
import { PageHeader } from "src/components/PageHeader";
import { Css } from "src/Css";
import { action } from "storybook/actions";

export default {
  component: PageHeader,
  parameters: {
    type: "figma",
    url: "https://www.figma.com/design/yJcdAYy1rqkxTTNhUQnjjU/H2-2026-Beam-Work?m=dev",
  },
} as Meta;

export function NoRightSlot() {
  return (
    <div css={Css.bgWhite.$}>
      <PageHeader title="Test Title" />
    </div>
  );
}

export function WithRightSlot() {
  return (
    <div css={Css.bgWhite.$}>
      <PageHeader
        title="Test Title"
        rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
      />
    </div>
  );
}
