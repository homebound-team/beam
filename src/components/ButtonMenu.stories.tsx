import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { ButtonMenu } from "src/components/ButtonMenu";
import { MenuItemType } from "src/components/internal/MenuItem";
import { Css } from "src/Css";
import { zeroTo } from "src/utils/sb";

export default {
  component: ButtonMenu,
  title: "Components/Button Menus",
} as Meta;

export function ButtonMenus() {
  const menuItems: MenuItemType[] = [
    { label: "Test Item", onClick: action("Test item clicked") },
    { label: "Test Item 2", onClick: action("Test item clicked 2") },
    { label: "Test Item 3", onClick: action("Test item clicked 3") },
    { label: "Homebound.com", onClick: "https://www.homebound.com" },
  ];
  const aLotOfItems: MenuItemType[] = zeroTo(400).map((i) => ({
    label: `Test Item ${i}`,
    onClick: action("Test item clicked"),
  }));
  return (
    <div css={Css.df.flexColumn.gap2.$}>
      <ButtonMenu triggerProps={{ label: "Test" }} menuProps={{ items: menuItems }} />
      <ButtonMenu triggerProps={{ icon: "verticalDots" }} menuProps={{ items: aLotOfItems }} />
    </div>
  );
}
