import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Tag } from "./Tag";

export default {
  title: "Workspace/Components/Tags",
  component: Tag,
} as Meta;

export function Tags() {
  return (
    <div css={Css.df.fdc.aifs.gap1.$}>
      <Tag text="Neutral" />
      <Tag text="info" type="info" />
      <Tag text="caution" type="caution" />
      <Tag text="warning" type="warning" />
      <Tag text="success" type="success" />
      <div css={Css.wPx(200).$}>
        <Tag text="Tag text that will truncate as it is too long." />
      </div>
    </div>
  );
}
