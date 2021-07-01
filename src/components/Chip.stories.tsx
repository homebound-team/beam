import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Chip, Css } from "src/index";

export default {
  component: Chip,
  title: "Components/Chip",
} as Meta;

export function DefaultChip() {
  return (
    <div>
      <div>
        <Chip text="First Last" onClick={action("click")} />
      </div>
      <div css={Css.wPx(300).$}>
        <Chip text={"First Last ".repeat(10)} onClick={action("click")} />
      </div>
    </div>
  );
}
