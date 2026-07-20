import { Meta } from "@storybook/react-vite";
import { ContrastScope } from "src/components";
import { Icons } from "src/components/Icon";
import { NavLink, NavLinkProps } from "src/components/NavLinks/NavLink";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";

export default {
  component: NavLink,

  args: {
    onClick: "",
    label: "Nav link",
    variant: "side",
  },

  argTypes: {
    icon: { control: { type: "select", options: Object.keys(Icons) } },
    __storyState: { control: false },
  },

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36081%3A105832",
    },
  },

  decorators: [withRouter()],
} as Meta;

export function BaseStates() {
  const sideArgs = { onClick: () => {}, variant: "side" as const, icon: "linkExternal" as const };
  const globalArgs = { onClick: () => {}, variant: "global" as const, icon: "linkExternal" as const };

  return (
    <div css={Css.df.gap2.$}>
      <div css={Css.df.fdc.gap2.p1.$}>
        <NavLink {...sideArgs} label="Side nav default" />
        <NavLink {...sideArgs} label="Side nav hovered" __storyState={{ hovered: true }} />
        <NavLink {...sideArgs} label="Side nav pressed" __storyState={{ pressed: true }} />
        <NavLink {...sideArgs} label="Side nav active" active />
        <NavLink {...sideArgs} label="Side nav focus ring" __storyState={{ focusVisible: true }} />
        <NavLink {...sideArgs} label="Side nav disabled" disabled />
      </div>
      <ContrastScope>
        <div css={Css.df.fdc.gap2.bgGray900.p1.br12.$}>
          <NavLink {...sideArgs} label="Side contrast nav default" />
          <NavLink {...sideArgs} label="Side contrast nav hovered" __storyState={{ hovered: true }} />
          <NavLink {...sideArgs} label="Side contrast nav pressed" __storyState={{ pressed: true }} />
          <NavLink {...sideArgs} label="Side contrast nav active" active />
          <NavLink {...sideArgs} label="Side contrast nav focus ring" __storyState={{ focusVisible: true }} />
          <NavLink {...sideArgs} label="Side contrast nav disabled" disabled />
        </div>
      </ContrastScope>
      <div css={Css.df.fdc.gap2.p1.$}>
        <NavLink {...globalArgs} label="Global nav default" />
        <NavLink {...globalArgs} label="Global nav hovered" __storyState={{ hovered: true }} />
        <NavLink {...globalArgs} label="Global nav pressed" __storyState={{ pressed: true }} />
        <NavLink {...globalArgs} label="Global nav active" active />
        <NavLink {...globalArgs} label="Global nav focus ring" __storyState={{ focusVisible: true }} />
        <NavLink {...globalArgs} label="Global nav disabled" disabled />
      </div>
    </div>
  );
}

export const NavLinks = (args: NavLinkProps) => {
  return (
    <div css={Css.df.gap2.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h2>Side nav link</h2>
        <NavLink {...args} icon={undefined} />
        <NavLink {...args} icon={undefined} active />
        <NavLink {...args} icon={undefined} disabled />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h2>Side nav link with icon</h2>
        <NavLink icon="linkExternal" {...args} />
        <NavLink icon="linkExternal" {...args} active />
        <NavLink icon="linkExternal" {...args} disabled />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h2>Global nav link</h2>
        <NavLink {...args} icon={undefined} variant="global" />
        <NavLink {...args} icon={undefined} variant="global" active />
        <NavLink {...args} icon={undefined} variant="global" disabled />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h2>Global nav link with icon</h2>
        <NavLink icon="linkExternal" {...args} variant="global" />
        <NavLink icon="linkExternal" {...args} variant="global" active />
        <NavLink icon="linkExternal" {...args} variant="global" disabled />
      </div>
    </div>
  );
};
