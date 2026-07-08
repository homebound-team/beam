import { Meta } from "@storybook/react-vite";
import { ContrastScope, Css, IconButton, IconButtonProps, Icons, Palette, Tokens } from "src";
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
    __storyState: { control: false },
  },

  parameters: {
    layout: "fullscreen",
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
  const content = (
    <div css={Css.p2.if(storyContrast).color(Tokens.OnSurface).$}>
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
          <IconButton {...iconArgs} __storyState={{ focusVisible: true }} />
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
  return storyContrast ? <ContrastScope>{content}</ContrastScope> : content;
}
export const Regular = Template.bind({});

export const Compact = Template.bind({});
// @ts-ignore
Compact.args = { compact: true };

export const Contrast = Template.bind({});
// @ts-ignore
Contrast.args = { storyContrast: true };
// @ts-ignore
Contrast.globals = { backgrounds: { value: "dark" } };

export const Circle = Template.bind({});
// @ts-ignore
Circle.args = { variant: "circle" };

export const Outline = Template.bind({});
// @ts-ignore
Outline.args = { variant: "outline" };

export const OutlineContrast = Template.bind({});
// @ts-ignore
OutlineContrast.args = { variant: "outline", storyContrast: true };
// @ts-ignore
OutlineContrast.globals = { backgrounds: { value: "dark" } };

export function WithTooltip() {
  return (
    <div css={Css.p2.dg.fdc.gap2.jcfs.$}>
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
    <div css={Css.p2.$}>
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

/** Drives real `useHover` styles via `__storyState` (ContrastScope is applied by Template). */
function HoveredIconButton({ storyContrast: _storyContrast, ...iconArgs }: IconButtonStoryArgs) {
  return <IconButton {...iconArgs} __storyState={{ hovered: true }} />;
}
