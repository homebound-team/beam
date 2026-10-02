import type { Meta } from "@storybook/react-vite";
import { ContextTag } from "src/components/ContextTag";
import { Css } from "src/Css";

export default {
  title: "Components/Context Tag",
  component: ContextTag,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2739-70",
    },
  },
} as Meta;

export function Examples() {
  return (
    <div css={Css.df.fdc.aifs.gap2.$}>
      <ContextTag icon="cube" text="Material" />
      <ContextTag icon="wrench" text="Labor" />
      <ContextTag icon="cubeDashed" text="Placeholder" />
    </div>
  );
}
