import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Tag } from "./Tag";

export default {
  title: "Workspace/Components/Tags",
  component: Tag,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36241%3A102420",
    },
  },
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

export function TagsWithAnIcon() {
  return (
    <div css={Css.df.fdc.aifs.gap1.$}>
      <Tag text="Neutral" icon="helpCircle" />
      <Tag text="info" type="info" icon="infoCircle" />
      <Tag text="caution" type="caution" icon="infoCircle" />
      <Tag text="warning" type="warning" icon="error" />
      <Tag text="success" type="success" icon="checkCircle" />
      <div css={Css.wPx(200).$}>
        <Tag text="Tag text that will truncate as it is too long." icon="infoCircle" />
      </div>
    </div>
  );
}
