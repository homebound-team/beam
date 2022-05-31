import { Meta } from "@storybook/react";
import { Icon as IconComponent, IconProps } from "src";
import { Css, Palette } from "src/Css";

export default {
  title: "Components/Icon",
  component: IconComponent,
  args: { color: "currentColor" },
  argTypes: {
    color: {
      control: {
        type: "select",
        labels: Object.fromEntries(Object.entries(Palette).map(([key, value]) => [value, key])),
      },
    },
  },
  parameters: { controls: { exclude: ["xss", "icon", "inc"] } },
} as Meta<IconProps>;

export const Icon = (props: IconProps) => {
  const actionIcons: IconProps["icon"][] = [
    "x",
    "loader",
    "linkExternal",
    "upload",
    "download",
    "checkboxChecked",
    "checkbox",
    "check",
    "search",
    "comment",
    "plus",
    "minus",
    "pencil",
    "cloudUpload",
    "toggleOn",
    "trash",
    "refresh",
    "eyeball",
    "thumbsUp",
    "verticalDots",
    "star",
    "starFilled",
    "cloudSave",
    "attachment",
    "archive",
    "unarchive",
  ];
  const alertIcons: IconProps["icon"][] = [
    "errorCircle",
    "checkCircle",
    "infoCircle",
    "helpCircle",
    "error",
    "xCircle",
  ];
  const arrowIcons: IconProps["icon"][] = [
    "chevronsDown",
    "chevronsRight",
    "sortUp",
    "sortDown",
    "chevronDown",
    "chevronUp",
    "chevronLeft",
    "chevronRight",
    "arrowBack",
    "menuClose",
    "menuOpen",
  ];
  const mediaIcons: IconProps["icon"][] = ["camera", "fileBlank", "folder", "image", "file", "images", "openBook"];
  const miscIcons: IconProps["icon"][] = ["dollar", "userCircle", "calendar"];
  const navigationIcons: IconProps["icon"][] = ["projects", "tasks", "finances", "templates", "tradePartners"];

  return (
    <div css={Css.gray900.$}>
      <h1 css={Css.xl2Em.$}>Actions</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(5, 1fr)", ...Css.dg.p0.$ }}>
        {actionIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Alerts</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(5, 1fr)", ...Css.dg.p0.$ }}>
        {alertIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Arrows</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {arrowIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Media</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {mediaIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Misc</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {miscIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Navigation</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {navigationIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
    </div>
  );
};
