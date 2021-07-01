import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Chip } from "src/index";

export default {
  component: Chip,
  title: "Components/Chip",
} as Meta;

export function DefaultChip() {
  return (
    <div>
      <Chip text={"First Last"} onClick={action("click")} />
    </div>
  );
}
