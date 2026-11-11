import type { Meta } from "@storybook/react-vite";
import { ProgressBar, type ProgressBarProps } from "src/components/ProgressBar";
import { Css } from "src/Css";
import { LabeledExamples } from "src/utils/sb";

export default {
  title: "Components/Progress Bar",
  component: ProgressBar,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=1345-1927",
    },
  },
} as Meta;

export function Examples() {
  return (
    <LabeledExamples
      examples={[
        { label: "Empty", children: <Sized value={0} /> },
        { label: "Partial", children: <Sized value={50} /> },
        { label: "Fractional", children: <Sized value={99.6} /> },
        { label: "Complete", children: <Sized value={100} /> },
        { label: "AI mode", children: <Sized value={50} aiMode /> },
      ]}
    />
  );
}

/** Sizes the bar here rather than via `exampleWidth`, which top-aligns the label for taller, field-sized examples. */
function Sized(props: ProgressBarProps) {
  return (
    <div css={Css.wPx(300).$}>
      <ProgressBar {...props} />
    </div>
  );
}
