import { Meta } from "@storybook/react-vite";
import { AiImporting } from "src/components/AiImporting";
import { Css } from "src/Css";

export default {
  component: AiImporting,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/igPmWwd7NXOygquKxxj0wa/Material-Import?node-id=310-47688&m=dev",
    },
  },
} as Meta;

export const Default = () => (
  <div css={Css.wPx(956).$}>
    <AiImporting />
  </div>
);

/** The copy wraps; the loader doesn't. */
export const Narrow = () => (
  <div css={Css.wPx(420).$}>
    <AiImporting />
  </div>
);

/** `title` and `message` default to the import copy, but either can be swapped per flow. */
export const CustomCopy = () => (
  <div css={Css.wPx(956).$}>
    <AiImporting title="Reading your spec..." message="We'll email you when this finishes." />
  </div>
);
