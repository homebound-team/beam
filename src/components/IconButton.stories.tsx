import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { IconButton as IconButton, IconButtonProps, iconButtonStylesHover, Icons } from "src";
import { Css, Palette } from "src/Css";

export default {
  title: "Components/Icon Button",
  component: IconButton,
  args: {
    icon: "arrowBack",
    onClick: action("onPress"),
  },
  argTypes: {
    icon: { control: { type: "select", options: Object.keys(Icons) } },
    autoFocus: { control: false },
  },
  parameters: {
    // To better view the hover state
    backgrounds: { default: "white" },
  },
} as Meta<IconButtonProps>;

export const IconButtonStyles = (args: IconButtonProps) => (
  <div css={{ h1: Css.xl2Em.mbPx(30).$, h2: Css.smEm.$ }}>
    <h1>Icon Only Button</h1>
    <div css={Css.df.gapPx(90).$}>
      <div>
        <h2>Default</h2>
        <IconButton {...args} />
      </div>
      <div>
        <h2>Hover</h2>
        <HoveredIconButton {...args} />
      </div>
      <div>
        <h2>Focused</h2>
        <IconButton {...args} autoFocus />
      </div>
      <div>
        <h2>Disabled</h2>
        <IconButton {...args} disabled />
      </div>
      <div>
        <h2>Colored</h2>
        <IconButton {...args} color={Palette.Red700} />
      </div>
      <div>
        <h2>Smaller</h2>
        <IconButton {...args} inc={2} />
      </div>
    </div>
  </div>
);

export function IconButtonDisabled() {
  return (
    <IconButton
      disabled={
        <div>
          You <b>cannot</b> currently perform this operation because of:
          <ul>
            <li>reason one</li>
            <li>reason two</li>
          </ul>
        </div>
      }
      icon="arrowBack"
    />
  );
}

/** Hover styled version of the IconButton */
function HoveredIconButton(args: IconButtonProps) {
  return (
    <div css={{ button: iconButtonStylesHover }}>
      <IconButton {...args} />
    </div>
  );
}
