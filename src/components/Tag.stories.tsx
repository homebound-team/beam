import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Tag } from "./Tag";

export default {
  title: "Components/Tag",
  component: Tag,
} as Meta;

export function TabBaseStates() {
  return (
    <div css={Css.df.flexColumn.itemsStart.childGap1.$}>
      <Tag text="Neutral" />
      <Tag text="info" type="info" />
      <Tag text="caution" type="caution" />
      <Tag text="warning" type="warning" />
      <Tag text="success" type="success" />
    </div>
  );
}
