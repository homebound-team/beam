import { Meta } from "@storybook/react-vite";
import { AiImportBanner } from "src/components/AiImportBanner";
import { Css } from "src/Css";

export default {
  component: AiImportBanner,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/igPmWwd7NXOygquKxxj0wa/Material-Import?node-id=310-47688&m=dev",
    },
  },
} as Meta;

export const Default = () => (
  <div css={Css.wPx(956).$}>
    <AiImportBanner />
  </div>
);

/** The copy wraps; the loader doesn't. */
export const Narrow = () => (
  <div css={Css.wPx(420).$}>
    <AiImportBanner />
  </div>
);

/** `title` and `message` default to the import copy, but either can be swapped per flow. */
export const CustomCopy = () => (
  <div css={Css.wPx(956).$}>
    <AiImportBanner title="Reading your spec..." message="We'll email you when this finishes." />
  </div>
);
