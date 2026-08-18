import { Meta } from "@storybook/react-vite";
import { AiLoadingPanel } from "src/components/AiLoadingPanel";
import { Css } from "src/Css";

export default {
  component: AiLoadingPanel,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/igPmWwd7NXOygquKxxj0wa/Material-Import?node-id=310-47688&m=dev",
    },
  },
} as Meta;

export const Default = () => (
  <div css={Css.wPx(956).$}>
    <AiLoadingPanel />
  </div>
);

/** The copy wraps; the loader doesn't. */
export const Narrow = () => (
  <div css={Css.wPx(420).$}>
    <AiLoadingPanel />
  </div>
);

/** `title` and `message` default to the import copy, but either can be swapped per flow. */
export const CustomCopy = () => (
  <div css={Css.wPx(956).$}>
    <AiLoadingPanel title="Reading your spec..." message="We'll email you when this finishes." />
  </div>
);
