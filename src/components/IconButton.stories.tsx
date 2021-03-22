import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { IconButton as IconButtonComponent, IconButtonProps, iconButtonStylesHover, Icons } from "src";
import { Css, px } from "src/Css";

export default {
  title: "Components/Icon Button",
  component: IconButtonComponent,
  args: {
    icon: "arrowBack",
    onClick: action("onPress"),
  },
  argTypes: {
    icon: { control: { type: "select", options: Object.keys(Icons) } },
    autoFocus: { control: false },
  },
  parameters: {
    // To better view the icon hover state
    backgrounds: { default: "white" },
  },
} as Meta<IconButtonProps>;

export const IconButton = (args: IconButtonProps) => (
  <div css={{ h1: Css.xl2Em.mbPx(30).$, h2: Css.smEm.$ }}>
    <h1>Icon Only Button</h1>
    <div css={Css.df.gap(px(90)).$}>
      <div>
        <h2>Default</h2>
        <IconButtonComponent {...args} />
      </div>
      <div>
        <h2>Hover</h2>
        <HoveredIconButton {...args} />
      </div>
      <div>
        <h2>Focused</h2>
        <IconButtonComponent {...args} autoFocus />
      </div>
      <div>
        <h2>Disabled</h2>
        <IconButtonComponent {...args} disabled />
      </div>
    </div>
  </div>
);

/** Hover styled version of the IconButton */
function HoveredIconButton(args: IconButtonProps) {
  return (
    <div css={{ button: iconButtonStylesHover }}>
      <IconButtonComponent {...args} />
    </div>
  );
}
