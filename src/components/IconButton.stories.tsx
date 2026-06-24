import { Meta } from "@storybook/react-vite";
import { ContrastScope, Css, IconButton, IconButtonProps, Icons, Palette } from "src";
import { noop } from "src/utils";
import { withRouter } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  component: IconButton,
  decorators: [withRouter()],

  args: {
    icon: "arrowBack",
    onClick: action("onPress"),
  },

  argTypes: {
    icon: { control: { type: "select", options: Object.keys(Icons) } },
    autoFocus: { control: false },
    storyContrast: { control: false },
  },

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31586%3A99884",
    },
  },

  globals: {
    backgrounds: {
      value: "white",
    },
  },
} as Meta<IconButtonProps & { storyContrast?: boolean }>;

type IconButtonStoryArgs = IconButtonProps & { storyContrast?: boolean };

function Template(args: IconButtonStoryArgs) {
  const { storyContrast = false, ...iconArgs } = args;
  const surface = (
    <div css={Css.if(storyContrast).bgGray800.white.$}>
      <h1 css={Css.xl2.mbPx(30).$}>Icon Only Button</h1>
      <div css={Css.df.gapPx(90).$}>
        <div>
          <h2>Default</h2>
          <IconButton {...iconArgs} />
        </div>
        <div>
          <h2>Hover</h2>
          <HoveredIconButton {...args} />
        </div>
        <div>
          <h2>Focused</h2>
          <IconButton {...iconArgs} autoFocus />
        </div>
        <div>
          <h2>Active</h2>
          <IconButton {...iconArgs} active />
        </div>
        <div>
          <h2>Disabled</h2>
          <IconButton {...iconArgs} disabled="Disabled reason" />
        </div>
        <div>
          <h2>Colored</h2>
          <IconButton {...iconArgs} color={Palette.Red700} />
        </div>
        <div>
          <h2>Labeled</h2>
          <IconButton {...iconArgs} label="Download" />
        </div>
      </div>
    </div>
  );
  return storyContrast ? <ContrastScope>{surface}</ContrastScope> : surface;
}
export const Regular = Template.bind({});

export const Compact = Template.bind({});
// @ts-ignore
Compact.args = { compact: true };

export const Contrast = Template.bind({});
// @ts-ignore
Contrast.args = { storyContrast: true };

export const Circle = Template.bind({});
// @ts-ignore
Circle.args = { variant: "circle" };

export const Outline = Template.bind({});
// @ts-ignore
Outline.args = { variant: "outline" };

export function WithTooltip() {
  return (
    <div css={Css.dg.fdc.gap2.jcfs.$}>
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
      <div>
        <h2>Tooltip provided via 'tooltip' property wrapping an anchor tag</h2>
        <IconButton icon="arrowBack" tooltip="Visit Homebound" onClick="https://www.homebound.com" />
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

/** Hover styled version of the IconButton — uses a scoped stylesheet to force hover styles for visual testing. */
function HoveredIconButton(args: IconButtonStoryArgs) {
  const { storyContrast = false, variant = "default", ...iconArgs } = args;
  const isCircle = variant === "circle";
  const isOutline = variant === "outline";
  const bg = storyContrast
    ? Palette.Gray700
    : isCircle
      ? Palette.Blue100
      : isOutline
        ? Palette.Gray100
        : Palette.Gray200;
  const borderColor = isCircle ? Palette.Blue200 : undefined;
  const hoverBlock = (
    <div className="hovered-icon-button">
      <style>{`.hovered-icon-button button { background-color: ${bg};${borderColor ? ` border-color: ${borderColor};` : ""} }`}</style>
      <IconButton {...iconArgs} variant={variant} active={isCircle} />
    </div>
  );
  return storyContrast ? <ContrastScope>{hoverBlock}</ContrastScope> : hoverBlock;
}
