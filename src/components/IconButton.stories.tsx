import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Css, px } from "src/Css";
import { IconButton as IconButtonComponent, IconButtonProps, Icons, stylesHover } from "src/index";

export default {
  title: "Components/Icon Button",
  component: IconButtonComponent,
  args: {
    icon: "arrowBack",
    onPress: action("onPress"),
  },
  argTypes: {
    icon: {
      control: {
        type: "select",
        options: Object.keys(Icons),
      },
    },
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
        <IconButtonComponent autoFocus {...args} />
      </div>
      <div>
        <h2>Disabled</h2>
        <IconButtonComponent {...args} isDisabled />
      </div>
    </div>
  </div>
);

/** Hover styled version of the IconButton */
function HoveredIconButton(args: IconButtonProps) {
  return (
    <div css={{ button: stylesHover }}>
      <IconButtonComponent {...args} />
    </div>
  );
}
