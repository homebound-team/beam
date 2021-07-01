import { Meta } from "@storybook/react";
import { Pills } from "src/components/Pills";
import { Css } from "src/Css";

export default {
  component: Pills,
  title: "Components/Pills",
} as Meta;

export function DefaultPills() {
  return (
    <div css={Css.wPx(300).ba.$}>
      <Pills values={["First Last", "Second Last", "Third Last", "Fourth Last"]} />
    </div>
  );
}
