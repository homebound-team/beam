import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { ButtonMenu, MenuItem } from "src/components/ButtonMenu";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";

export default {
  component: ButtonMenu,
  title: "Components/Button Menus",
  decorators: [withRouter()],
} as Meta;

export function ButtonMenus() {
  const menuItems: MenuItem[] = [
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ];

  return (
    <div css={Css.df.flexColumn.$}>
      <h2 css={Css.lg.$}>Default - Anchored bottom left</h2>
      <ButtonMenu
        trigger={{ label: "Menu trigger" }}
        items={menuItems}
        persistentActions={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
        defaultOpen
      />

      <div css={Css.mtPx(200).$}>
        <h2 css={Css.lg.$}>Anchored to bottom right</h2>
        <div css={Css.mlPx(200).$}>
          <ButtonMenu
            trigger={{ label: "Menu trigger" }}
            items={menuItems}
            persistentActions={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
            defaultOpen
            placement="bottom right"
          />
        </div>
      </div>

      <div css={Css.mtPx(200).$}>
        <h2 css={Css.lg.$}>Anchored to top left</h2>
        <div css={Css.mtPx(200).$}>
          <ButtonMenu
            trigger={{ label: "Menu trigger" }}
            items={menuItems}
            persistentActions={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
            defaultOpen
            placement="top left"
          />
        </div>
      </div>

      <div css={Css.mtPx(20).$}>
        <h2 css={Css.lg.$}>Anchored to top right</h2>
        <div css={Css.mlPx(200).mtPx(200).$}>
          <ButtonMenu
            trigger={{ label: "Menu trigger" }}
            items={menuItems}
            persistentActions={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
            defaultOpen
            placement="top right"
          />
        </div>
      </div>
    </div>
  );
}

export function InteractiveMenu() {
  const menuItems: MenuItem[] = [
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ];

  return (
    <ButtonMenu
      trigger={{ label: "Menu trigger" }}
      items={menuItems}
      persistentActions={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
    />
  );
}
