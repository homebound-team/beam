import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Tag } from "./Tag";

export default {
  title: "Components/Tags",
  component: Tag,
} as Meta;

export function Tags() {
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
