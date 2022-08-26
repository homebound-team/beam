import { LoadingSkeleton, LoadingSkeletonProps } from "src/components";
import { Css } from "src/Css";

export default {
  component: LoadingSkeleton,
  title: "Components/LoadingSkeleton",
};

export const Examples = () => (
  <div>
    <h1 css={Css.xl2Em.mb1.bb.bGray400.$}>Sizes</h1>
    <h2 css={Css.xl.$}>Small</h2>
    <LoadingSkeleton size="sm" />
    <h2 css={Css.xl.$}>Medium</h2>
    <LoadingSkeleton size="md" />
    <h2 css={Css.xl.$}>Large</h2>
    <LoadingSkeleton size="lg" />

    <h1 css={Css.xl2Em.mb1.mt4.bb.bGray400.$}>Multiple Rows</h1>
    <LoadingSkeleton rows={3} />

    <h1 css={Css.xl2Em.mb1.mt4.bb.bGray400.$}>Multiple Rows with Randomized Widths</h1>
    <LoadingSkeleton rows={6} randomizeWidths />

    <h1 css={Css.xl2Em.mb1.mt4.bb.bGray400.$}>Rows and Columns</h1>
    <LoadingSkeleton rows={3} columns={5} />
  </div>
);

function Template(args: LoadingSkeletonProps) {
  return (
    <div>
      <h1 css={Css.xl2Em.mb1.bb.bGray400.$}>Use Control Panel to Set Properties</h1>
      <LoadingSkeleton {...args} />
    </div>
  );
}

export const InteractiveExample = Template.bind({});
// @ts-ignore
InteractiveExample.args = {
  size: "md",
  rows: 5,
  columns: 1,
  randomizeWidths: true,
};

// TODO: Add contrast styles
// export const Contrast = () =>
// Contrast.parameters = { backgrounds: { default: "dark" } };
