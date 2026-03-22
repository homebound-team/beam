import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";

export default {
  title: "Foundations/Box Shadow",
} as Meta;

export const BoxShadow = () => (
  <div>
    <h1 css={Css.xl2.mb4.$}>Drop Shadows</h1>
    <div css={Css.df.gap4.$}>
      <div>
        <h2 css={Css.xl.mb4.$}>Basic</h2>
        <div css={Css.hPx(250).wPx(250).bshBasic.$}></div>
      </div>
      <div>
        <h2 css={Css.xl.mb4.$}>Hover</h2>
        <div css={Css.hPx(250).wPx(250).bshHover.$}></div>
      </div>
    </div>
  </div>
);
