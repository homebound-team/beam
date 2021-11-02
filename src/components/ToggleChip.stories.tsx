import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Css, ToggleChip } from "src/index";

export default {
  component: ToggleChip,
  title: "Components/ToggleChip",
} as Meta;

export function DefaultToggleChip() {
  return (
    <div css={Css.wPx(300).df.fdc.aifs.childGap2.$}>
      <ToggleChip text="First Last" onClick={action("click")} />
      <ToggleChip text="Disabled Chip" disabled onClick={action("click")} />
      <ToggleChip text={"First Last ".repeat(10)} onClick={action("click")} />
    </div>
  );
}
