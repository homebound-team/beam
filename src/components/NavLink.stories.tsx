import { Meta } from "@storybook/react";
import { Fragment } from "react";
import { navLink } from "src/components";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";
import { Icon, Icons } from "./Icon";
import { getNavLinkStyles, NavLink, NavLinkProps } from "./NavLink";

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
  parameters: {
    // To better view the hover state
    backgrounds: { default: "white" },
  },
  decorators: [withRouter()],
} as Meta;

export function BaseStates() {
  const sideNavStyles = getNavLinkStyles("side");
  const sideContrastNavStyles = getNavLinkStyles("side", true);
  const globalNavStyles = getNavLinkStyles("global");
  const args = { href: "", className: navLink };

  return (
    <div css={Css.df.childGap2.$}>
      <div css={Css.df.fdc.childGap2.p1.$}>
        <a {...args} css={sideNavStyles.baseStyles}>
          {getChildren("Side nav default")}
        </a>
        <a {...args} css={{ ...sideNavStyles.baseStyles, ...sideNavStyles.hoverStyles }}>
          {getChildren("Side nav hovered")}
        </a>
        <a {...args} css={{ ...sideNavStyles.baseStyles, ...sideNavStyles.pressedStyles }}>
          {getChildren("Side nav pressed")}
        </a>
        <a {...args} css={{ ...sideNavStyles.baseStyles, ...sideNavStyles.activeStyles }}>
          {getChildren("Side nav active")}
        </a>
        <a {...args} css={{ ...sideNavStyles.baseStyles, ...sideNavStyles.focusRingStyles }}>
          {getChildren("Side nav focus ring")}
        </a>
        <a {...args} css={{ ...sideNavStyles.baseStyles, ...sideNavStyles.disabledStyles }}>
          {getChildren("Side nav disabled")}
        </a>
      </div>
      <div css={Css.df.fdc.childGap2.bgGray900.p1.br12.$}>
        <a {...args} css={sideContrastNavStyles.baseStyles}>
          {getChildren("Side contrast nav default")}
        </a>
        <a {...args} css={{ ...sideContrastNavStyles.baseStyles, ...sideContrastNavStyles.hoverStyles }}>
          {getChildren("Side contrast nav hovered")}
        </a>
        <a {...args} css={{ ...sideContrastNavStyles.baseStyles, ...sideContrastNavStyles.pressedStyles }}>
          {getChildren("Side contrast nav pressed")}
        </a>
        <a {...args} css={{ ...sideContrastNavStyles.baseStyles, ...sideContrastNavStyles.activeStyles }}>
          {getChildren("Side contrast nav active")}
        </a>
        <a {...args} css={{ ...sideContrastNavStyles.baseStyles, ...sideContrastNavStyles.focusRingStyles }}>
          {getChildren("Side contrast nav focus ring")}
        </a>
        <a {...args} css={{ ...sideContrastNavStyles.baseStyles, ...sideContrastNavStyles.disabledStyles }}>
          {getChildren("Side contrast nav disabled")}
        </a>
      </div>
      <div css={Css.df.fdc.childGap2.p1.$}>
        <a {...args} css={globalNavStyles.baseStyles}>
          {getChildren("Global nav default")}
        </a>
        <a {...args} css={{ ...globalNavStyles.baseStyles, ...globalNavStyles.hoverStyles }}>
          {getChildren("Global nav hovered")}
        </a>
        <a {...args} css={{ ...globalNavStyles.baseStyles, ...globalNavStyles.pressedStyles }}>
          {getChildren("Global nav pressed")}
        </a>
        <a {...args} css={{ ...globalNavStyles.baseStyles, ...globalNavStyles.activeStyles }}>
          {getChildren("Global nav active")}
        </a>
        <a {...args} css={{ ...globalNavStyles.baseStyles, ...globalNavStyles.focusRingStyles }}>
          {getChildren("Global nav focus ring")}
        </a>
        <a {...args} css={{ ...globalNavStyles.baseStyles, ...globalNavStyles.disabledStyles }}>
          {getChildren("Global nav disabled")}
        </a>
      </div>
    </div>
  );
}

function getChildren(label: string) {
  return (
    <Fragment>
      {label}
      <Icon icon="linkExternal" css={Css.ml1.$} />
    </Fragment>
  );
}

export const NavLinks = (args: NavLinkProps) => {
  return (
    <div css={Css.df.childGap2.$}>
      <div css={Css.df.fdc.childGap2.$}>
        <h2>Side nav link</h2>
        <NavLink {...args} icon={undefined} />
        <NavLink {...args} icon={undefined} active />
        <NavLink {...args} icon={undefined} disabled />
      </div>
      <div css={Css.df.fdc.childGap2.$}>
        <h2>Side nav link with icon</h2>
        <NavLink icon="linkExternal" {...args} />
        <NavLink icon="linkExternal" {...args} active />
        <NavLink icon="linkExternal" {...args} disabled />
      </div>
      <div css={Css.df.fdc.childGap2.$}>
        <h2>Global nav link</h2>
        <NavLink {...args} icon={undefined} variant="global" />
        <NavLink {...args} icon={undefined} variant="global" active />
        <NavLink {...args} icon={undefined} variant="global" disabled />
      </div>
      <div css={Css.df.fdc.childGap2.$}>
        <h2>Global nav link with icon</h2>
        <NavLink icon="linkExternal" {...args} variant="global" />
        <NavLink icon="linkExternal" {...args} variant="global" active />
        <NavLink icon="linkExternal" {...args} variant="global" disabled />
      </div>
    </div>
  );
};
