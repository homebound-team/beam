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
    "duplicate",
    "filter",
    "columns",
  ];
  const alertIcons: IconProps["icon"][] = [
    "errorCircle",
    "checkCircle",
    "infoCircle",
    "helpCircle",
    "error",
    "xCircle",
    "flag",
    "outlineFlag",
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
    "arrowLeft",
    "arrowBack",
    "arrowUp",
    "arrowDown",
    "arrowRight",
    "menuClose",
    "menuOpen",
  ];
  const mediaIcons: IconProps["icon"][] = ["camera", "fileBlank", "folder", "image", "file", "images", "openBook"];
  const miscIcons: IconProps["icon"][] = ["dollar", "userCircle", "calendar", "buildingHouse", "house"];
  const navigationIcons: IconProps["icon"][] = ["projects", "tasks", "finances", "templates", "tradePartners"];
  const weatherIcons: IconProps["icon"][] = ["fog", "cloudy", "hail", "ice", "partlyCloudy", "rain", "snow", "sunny", "thunderstorms", "windy"];

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
      <h1 css={Css.xl2Em.$}>Weather</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(5, 1fr)", ...Css.dg.p0.$ }}>
        {weatherIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
    </div>
  );
};
