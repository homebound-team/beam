import { Meta } from "@storybook/react";
import { Chip } from "src/components/Chip";
import { Css } from "src/Css";

export default {
  component: Chip,
  title: "Components/Chip",
} as Meta;

export function DefaultChip() {
  return (
    <div>
      <div>
        <Chip text="First Last" />
      </div>
      <div css={Css.wPx(300).$}>
        <Chip text={"First Last ".repeat(10)} />
      </div>
    </div>
  );
}
