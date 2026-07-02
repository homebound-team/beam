import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { Tag } from "./Tag";

export default {
  component: Tag,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36241%3A102420",
    },
  },
} as Meta;

export function Examples() {
  return (
    <div css={Css.dg.gtc("repeat(3, minmax(0, 1fr))").gap1.$}>
      <div css={Css.df.fdc.aifs.gap1.$}>
        <h3 css={Css.mb1.mdSb.$}>Label Only</h3>
        <Tag text="info" type="info" />
        <Tag text="update" type="update" />
        <Tag text="error" type="error" />
        <Tag text="warning" type="warning" />
        <Tag text="success" type="success" />
        <Tag text="Neutral" />
      </div>
      <div css={Css.df.fdc.aifs.gap1.$}>
        <h3 css={Css.mb1.mdSb.$}>Label & Icon</h3>
        <Tag text="info" type="info" icon="refresh" />
        <Tag text="update" type="update" icon="arrowFromBottom" />
        <Tag text="error" type="error" icon="xCircle" />
        <Tag text="warning" type="warning" icon="error" />
        <Tag text="success" type="success" icon="check" />
        <Tag text="Neutral" icon="helpCircle" />
      </div>
      <div css={Css.df.fdc.aifs.gap1.$}>
        <h3 css={Css.mb1.mdSb.$}>Icon Only</h3>
        <Tag text="Information" type="info" icon="refresh" iconOnly />
        <Tag text="Updates" type="update" icon="arrowFromBottom" iconOnly />
        <Tag text="Error" type="error" icon="xCircle" iconOnly />
        <Tag text="Warning" type="warning" icon="error" iconOnly />
        <Tag text="Success" type="success" icon="check" iconOnly />
        <Tag text="Neutral" icon="helpCircle" iconOnly />
      </div>
    </div>
  );
}

export function CustomColor() {
  return (
    <div css={Css.df.fdc.aifs.gap1.$}>
      <h3 css={Css.mb1.mdSb.$}>Custom Color</h3>
      <p>Ideally not used, but if you must, you can supply a custom color using the `xss` prop.</p>
      <Tag text="Purple" xss={Css.bgPurple200.$} />
      <Tag text="Blue" xss={Css.bgBlue200.$} />
      <Tag text="Green" xss={Css.bgGreen200.$} />
      <Tag text="Yellow" xss={Css.bgYellow200.$} />
      <Tag text="Orange" xss={Css.bgOrange200.$} />
      <Tag text="Red" xss={Css.bgRed200.$} />
      <Tag text="Gray" xss={Css.bgGray200.$} />
    </div>
  );
}

export function Truncated() {
  return (
    <div css={Css.wPx(200).$}>
      <Tag text="Tag text that will truncate as it is too long." />
      <Tag text="Tag text that will truncate as it is too long." icon="infoCircle" />
    </div>
  );
}
