import { Meta } from "@storybook/react-vite";
import { PageHeader } from "src/components/PageHeader";
import { Css } from "src/Css";

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
      <PageHeader title="Test Title" rightSlot={<span>Right Slot</span>} />
    </div>
  );
}
