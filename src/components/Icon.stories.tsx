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
    "commentFilled",
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
    "add",
    "remove",
    "pin",
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
    "loaderCircle",
    "circleOutline",
    "time",
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
    "inbox",
    "dollar",
    "userCircle",
    "calendar",
    "calendarError",
    "calendarX",
    "buildingHouse",
    "house",
    "bell",
    "customize",
    "leaf",
    "floorPlan",
    "chair",
    "bolt",
    "changeEvent",
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
    "cart",
    "programChange",
    "architectural",
    "structural",
    "mep",
    "designPackage",
    "updateDesignPackage",
    "exteriorStyle",
    "lockOpen",
    "map",
    "history",
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
      <ul css={Css.dg.gtc("repeat(5, 1fr)").gap3.add({ listStyle: "none" }).$}>
        {actionIcons.map((icon, i) => (
          <li key={icon} css={Css.xsMd.df.aic.fdc.gap1.$}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Alerts</h1>
      <ul css={Css.dg.gtc("repeat(5, 1fr)").gap3.add({ listStyle: "none" }).$}>
        {alertIcons.map((icon, i) => (
          <li key={icon} css={Css.xsMd.df.aic.fdc.gap1.$}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Arrows</h1>
      <ul css={Css.dg.gtc("repeat(4, 1fr)").gap3.add({ listStyle: "none" }).$}>
        {arrowIcons.map((icon, i) => (
          <li key={icon} css={Css.xsMd.df.aic.fdc.gap1.$}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Media</h1>
      <ul css={Css.dg.gtc("repeat(4, 1fr)").gap3.add({ listStyle: "none" }).$}>
        {mediaIcons.map((icon, i) => (
          <li key={icon} css={Css.xsMd.df.aic.fdc.gap1.$}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Misc</h1>
      <ul css={Css.dg.gtc("repeat(4, 1fr)").gap3.add({ listStyle: "none" }).$}>
        {miscIcons.map((icon, i) => (
          <li key={icon} css={Css.xsMd.df.aic.fdc.gap1.$}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Navigation</h1>
      <ul css={Css.dg.gtc("repeat(4, 1fr)").gap3.add({ listStyle: "none" }).$}>
        {navigationIcons.map((icon, i) => (
          <li key={icon} css={Css.xsMd.df.aic.fdc.gap1.$}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Sb.$}>Weather</h1>
      <ul css={Css.dg.gtc("repeat(5, 1fr)").gap3.add({ listStyle: "none" }).$}>
        {weatherIcons.map((icon, i) => (
          <li key={icon} css={Css.xsMd.df.aic.fdc.gap1.$}>
            <IconComponent icon={icon} data-testid={icon} id={icon} color={props.color} />
            {icon}
          </li>
        ))}
      </ul>
    </div>
  );
};
