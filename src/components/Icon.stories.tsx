import { Meta } from "@storybook/react";
import { Css, Icon as IconComponent, IconProps } from "src";

export default {
  title: "Components/Icon",
  component: IconComponent,
} as Meta<IconProps>;

export const Icon = () => {
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
    "pencil",
    "cloudUpload",
    "toggleOn",
    "trash",
  ];
  const alertIcons: IconProps["icon"][] = ["errorCircle", "checkCircle", "infoCircle", "helpCircle", "error"];
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
  ];
  const mediaIcons: IconProps["icon"][] = ["camera", "fileBlank", "folder", "image", "file", "images"];
  const miscIcons: IconProps["icon"][] = ["dollar", "userCircle", "calendar"];
  const navigationIcons: IconProps["icon"][] = ["projects", "tasks", "finances", "templates", "tradePartners"];

  return (
    <div css={Css.coolGray900.$}>
      <h1 css={Css.xl2Em.$}>Actions</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(5, 1fr)", ...Css.dg.p0.$ }}>
        {actionIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.itemsCenter.flexColumn.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Alerts</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(5, 1fr)", ...Css.dg.p0.$ }}>
        {alertIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.itemsCenter.flexColumn.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Arrows</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {arrowIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.itemsCenter.flexColumn.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Media</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {mediaIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.itemsCenter.flexColumn.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Misc</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {miscIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.itemsCenter.flexColumn.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} />
            {icon}
          </li>
        ))}
      </ul>
      <h1 css={Css.xl2Em.$}>Navigation</h1>
      <ul css={{ gap: 24, listStyle: "none", gridTemplateColumns: "repeat(4, 1fr)", ...Css.dg.p0.$ }}>
        {navigationIcons.map((icon, i) => (
          <li css={{ gap: 8, ...Css.xsEm.df.itemsCenter.flexColumn.$ }} key={icon}>
            <IconComponent icon={icon} data-testid={icon} id={icon} />
            {icon}
          </li>
        ))}
      </ul>
    </div>
  );
};
