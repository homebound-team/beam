import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Chip as ChipComponent } from "src/index";

export default {
  component: ChipComponent,
  title: "Components/Chip",
} as Meta;

export function Chip() {
  return (
    <div>
      <ChipComponent text={"First Last"} onClick={action("click")} />
    </div>
  );
}
