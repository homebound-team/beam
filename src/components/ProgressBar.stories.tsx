import type { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { ProgressBar } from "./ProgressBar";

export default {
  component: ProgressBar,
} as Meta;

export function Values() {
  return (
    <div css={Css.df.fdc.gap2.wPx(300).$}>
      {[0, 10, 50, 99, 100].map((value) => (
        <ProgressBar key={value} value={value} />
      ))}
    </div>
  );
}

export function AiMode() {
  return (
    <div css={Css.df.fdc.gap2.p2.wPx(300).bgPurple50.$}>
      {[0, 50, 100].map((value) => (
        <ProgressBar key={value} value={value} aiMode />
      ))}
    </div>
  );
}
