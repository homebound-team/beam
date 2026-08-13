import { Meta } from "@storybook/react-vite";
import { AiLoader } from "src/components/AiLoader";
import { Css } from "src/Css";

export default {
  component: AiLoader,
} as Meta;

export const Sizes = () => (
  <div css={Css.df.fdc.gap3.aifs.$}>
    {[2, 3, 4, 6].map((inc) => (
      <div key={inc} css={Css.df.aic.gap2.$}>
        <span css={Css.sm.gray800.wPx(64).$}>
          inc={inc}
          {inc === 3 && " (default)"}
        </span>
        <AiLoader inc={inc} />
      </div>
    ))}
  </div>
);
