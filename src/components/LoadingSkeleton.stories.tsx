import { LoadingSkeleton, LoadingSkeletonProps } from "src/components";
import { Css } from "src/Css";

export default {
  component: LoadingSkeleton,
};

export const Examples = () => (
  <div>
    <h1 css={Css.xl2Sb.mb1.bb.bcGray400.$}>Sizes</h1>
    <h2 css={Css.xl.$}>Small</h2>
    <LoadingSkeleton size="sm" />
    <h2 css={Css.xl.$}>Medium</h2>
    <LoadingSkeleton size="md" />
    <h2 css={Css.xl.$}>Large</h2>
    <LoadingSkeleton size="lg" />

    <h1 css={Css.xl2Sb.mb1.mt4.bb.bcGray400.$}>Multiple Rows</h1>
    <LoadingSkeleton rows={3} />

    <h1 css={Css.xl2Sb.mb1.mt4.bb.bcGray400.$}>Multiple Rows with Randomized Widths</h1>
    <LoadingSkeleton rows={6} randomizeWidths />

    <h1 css={Css.xl2Sb.mb1.mt4.bb.bcGray400.$}>Rows and Columns</h1>
    <LoadingSkeleton rows={3} columns={5} />
  </div>
);

const Template = (args: LoadingSkeletonProps) => (
  <div>
    <h1 css={Css.xl2Sb.mb1.bb.bcGray400.$}>Use Control Panel to Set Properties</h1>
    <LoadingSkeleton {...args} />
  </div>
);

export const InteractiveExample = Template.bind({});
// @ts-ignore
InteractiveExample.args = {
  size: "md",
  rows: 5,
  columns: 1,
  randomizeWidths: true,
};

export const Contrast = () => (
  <div>
    <h1 css={Css.xl2Sb.mb1.bb.bcGray400.gray400.$}>Contrast Background Example</h1>
    <LoadingSkeleton rows={5} contrast />
  </div>
);
Contrast.parameters = { backgrounds: { default: "dark" } };
