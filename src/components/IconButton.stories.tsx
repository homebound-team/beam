import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import {
  Css,
  IconButton,
  iconButtonContrastStylesHover,
  IconButtonProps,
  iconButtonStylesHover,
  Icons,
  Palette,
} from "src";
import { noop } from "src/utils";
import { withRouter } from "src/utils/sb";

export default {
  title: "Components/Icon Button",
  component: IconButton,
  decorators: [withRouter()],
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

function Template(args: IconButtonProps) {
  return (
    <div css={Css.if(!!args.contrast).bgGray800.white.$}>
      <h1 css={Css.xl2Sb.mbPx(30).$}>Icon Only Button</h1>
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
          <IconButton {...args} disabled="Disabled reason" />
        </div>
        <div>
          <h2>Colored</h2>
          <IconButton {...args} color={Palette.Red700} />
        </div>
      </div>
    </div>
  );
}
export const Regular = Template.bind({});

export const Compact = Template.bind({});
// @ts-ignore
Compact.args = { compact: true };

export const Contrast = Template.bind({});
// @ts-ignore
Contrast.args = { contrast: true };

export function WithTooltip() {
  return (
    <div css={Css.dg.fdc.childGap2.jcfs.$}>
      <div>
        <h2>Tooltip provided via 'disabled' property</h2>
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
          onClick={noop}
        />
      </div>
      <div>
        <h2>Tooltip provided via 'tooltip' property</h2>
        <IconButton icon="arrowBack" tooltip="Back to previous page" onClick={noop} />
      </div>
    </div>
  );
}

export function IconButtonLink() {
  return (
    <div>
      <div>
        <h2>Relative Path Link</h2>
        <IconButton icon="plus" onClick="/fakePath" />
      </div>
      <div>
        <h2>Relative Path - Open in new tab</h2>
        <IconButton icon="arrowBack" onClick="/" openInNew />
      </div>
      <div>
        <h2>Absolute Link</h2>
        <IconButton icon="linkExternal" onClick="https://www.homebound.com" />
      </div>
    </div>
  );
}

/** Hover styled version of the IconButton */
function HoveredIconButton(args: IconButtonProps) {
  return (
    <div css={{ button: args.contrast ? iconButtonContrastStylesHover : iconButtonStylesHover }}>
      <IconButton {...args} />
    </div>
  );
}
