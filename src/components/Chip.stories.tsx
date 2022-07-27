import { Meta } from "@storybook/react";
import { Chip, ChipTypes } from "src/components/Chip";
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

export function ColoredChips() {
  return (
    <div>
      <div css={Css.df.wPx(500).$}>
        <Chip text="default" />
        <Chip text="caution" type={ChipTypes.caution} />
        <Chip text="warning" type={ChipTypes.warning} />
        <Chip text="success" type={ChipTypes.success} />
      </div>
    </div>
  );
}
