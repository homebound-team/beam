import { Meta } from "@storybook/react";
import { Chips } from "src/components/Chips";
import { Css } from "src/Css";

export default {
  component: Chips,
  title: "Components/Chips",
} as Meta;

export function DefaultChips() {
  return (
    <div css={Css.wPx(300).ba.$}>
      <Chips values={["First Last", "Second Last", "Third Last", "Fourth Last"]} />
    </div>
  );
}
