import { Meta } from "@storybook/react";
import { Pill } from "src/components/Pill";
import { Css } from "src/Css";

export default {
  component: Pill,
  title: "Components/Pill",
} as Meta;

export function DefaultPill() {
  return (
    <div>
      <div>
        <Pill text="First Last" />
      </div>
      <div css={Css.wPx(300).$}>
        <Pill text={"First Last ".repeat(10)} />
      </div>
    </div>
  );
}
