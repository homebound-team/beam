import type { Meta } from "@storybook/react-vite";
import { ContextTag } from "src/components/ContextTag";
import { LabeledExamples } from "src/utils/sb";

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
    <LabeledExamples
      examples={[
        {
          label: "Variants",
          children: (
            <>
              <ContextTag icon="cube" text="Material" />
              <ContextTag icon="wrench" text="Labor" />
              <ContextTag icon="cubeDashed" text="Placeholder" />
            </>
          ),
        },
        {
          label: "Other icons",
          children: (
            <>
              <ContextTag icon="lot" text="Lot" />
              <ContextTag icon="task" text="Task" />
              <ContextTag icon="bill" text="Bill" />
              <ContextTag icon="hardHat" text="Trade" />
            </>
          ),
        },
      ]}
    />
  );
}
