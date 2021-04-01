import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { NavLink, NavLinkProps } from "src/index";
import { Icons } from "./Icon";

export default {
  title: "Components/NavLinks",
  component: NavLink,
  args: {
    href: "",
    label: "Nav link",
    variant: "side",
  },
  argTypes: {
    icon: { control: { type: "select", options: Object.keys(Icons) } },
  },
} as Meta;

export const NavLinks = (args: NavLinkProps) => {
  return (
    <div css={Css.df.gap2.$}>
      <div css={Css.df.flexColumn.gap2.$}>
        <h2>Side nav link</h2>
        <NavLink {...args} icon={undefined} />
        <NavLink {...args} icon={undefined} active />
        <NavLink {...args} icon={undefined} disabled />
      </div>
      <div css={Css.df.flexColumn.gap2.$}>
        <h2>Side nav link with icon</h2>
        <NavLink icon="linkExternal" {...args} />
        <NavLink icon="linkExternal" {...args} active />
        <NavLink icon="linkExternal" {...args} disabled />
      </div>
      <div css={Css.df.flexColumn.gap2.$}>
        <h2>Global nav link</h2>
        <NavLink {...args} icon={undefined} variant="global" />
        <NavLink {...args} icon={undefined} variant="global" active />
        <NavLink {...args} icon={undefined} variant="global" disabled />
      </div>
      <div css={Css.df.flexColumn.gap2.$}>
        <h2>Global nav link with icon</h2>
        <NavLink icon="linkExternal" {...args} variant="global" />
        <NavLink icon="linkExternal" {...args} variant="global" active />
        <NavLink icon="linkExternal" {...args} variant="global" disabled />
      </div>
    </div>
  );
};
