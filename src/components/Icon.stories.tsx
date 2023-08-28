import { Meta } from "@storybook/react";
import { Icon as IconComponent, IconProps } from "src";
import { Css, Palette } from "src/Css";

export default {
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
    "link",
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
    "kanban",
    "expand",
    "collapse",
    "undoCircle",
    "drag",
    "move",
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
    "circle",
    "checkCircleFilled",
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
    "arrowFromBottom",
    "arrowFromLeft",
    "arrowFromRight",
    "arrowFromTop",
    "triangleLeft",
    "triangleRight",
    "triangleUp",
    "triangleDown",
    "subDirectoryRight",
  ];
  const mediaIcons: IconProps["icon"][] = [
    "camera",
    "email",
    "fileBlank",
    "folder",
    "image",
    "file",
    "images",
    "openBook",
  ];
  const miscIcons: IconProps["icon"][] = [
    "dollar",
    "userCircle",
    "calendar",
    "buildingHouse",
    "house",
    "bell",
    "customize",
    "leaf",
    "floorPlan",
    "chair",
    "bolt",
    "changeEvent",
    "calendarError",
    "nested",
    "estimate",
    "commentItem",
    "todo",
    "projectItem",
    "bill",
    "commitment",
    "document",
    "budgetReallocation",
    "cog",
    "abacus",
    "hardHat",
    "task",
    "checklistComplete",
    "checklistNotComplete",
    "criticalPath",
    "faucet",
    "bed",
    "sqFeet",
    "ruler",
    "palette",
    "bath",
    "car",
    "basement",
    "cube",
  ];
  const navigationIcons: IconProps["icon"][] = [
    "projects",
    "tasks",
    "finances",
    "templates",
    "tradePartners",
    "menu",
    "tile",
    "list",
  ];
  const weatherIcons: IconProps["icon"][] = [
    "fog",
    "cloudy",
    "hail",
    "ice",
    "partlyCloudy",
    "rain",
    "snow",
    "sunny",
    "thunderstorms",
    "windy",
  ];

  return (
    <div css={Css.gray900.$}>
      <h1 css={Css.xl2Sb.$}>Actions</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(5, 1fr)", ...Css.dg.p0.$ }}>
        {actionIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsMd.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Alerts</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(5, 1fr)", ...Css.dg.p0.$ }}>
        {alertIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsMd.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Arrows</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {arrowIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsMd.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Media</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {mediaIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsMd.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Misc</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {miscIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsMd.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Navigation</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {navigationIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsMd.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Weather</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(5, 1fr)", ...Css.dg.p0.$ }}>
        {weatherIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsMd.df.aic.fdc.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
    </div>
  );
};
