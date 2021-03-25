import { Meta } from "@storybook/react";
import { Css } from "src/Css";

export default {
  title: "Foundations/Box Shadow",
} as Meta;

export const BoxShadow = () => (
  <div css={{ h1: Css.xl4Em.mb4.$, h2: Css.xl2Em.mb4.$ }}>
    <h1 css={Css.xl2Em.$}>Drop Shadow</h1>
    <div css={Css.df.gap4.$}>
      <div>
        <h2>Basic</h2>
        <div css={Css.hPx(250).wPx(250).bshBasic.$}></div>
      </div>
      <div>
        <h2>Hover</h2>
        <div css={Css.hPx(250).wPx(250).bshHover.$}></div>
      </div>
    </div>
  </div>
);
