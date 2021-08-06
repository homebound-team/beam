import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { ButtonMenu, MenuItem } from "src/components/ButtonMenu";
import { Css } from "src/Css";
import { withDimensions, withRouter } from "src/utils/sb";

export default {
  component: ButtonMenu,
  title: "Components/Button Menus",
  decorators: [withRouter(), withDimensions()],
} as Meta;

export function MenuOpen() {
  const menuItems: MenuItem[] = [
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ];

  return (
    <div css={Css.df.flexColumn.$}>
      <h2 css={Css.lg.$}>Default - Anchored left</h2>
      <ButtonMenu
        trigger={{ label: "Menu trigger" }}
        items={menuItems}
        persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
        defaultOpen
      />

      <div css={Css.mtPx(200).$}>
        <h2 css={Css.lg.$}>Anchored right</h2>
        <div css={Css.mlPx(200).$}>
          <ButtonMenu
            trigger={{ label: "Menu trigger" }}
            items={menuItems}
            persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
            defaultOpen
            placement="right"
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
      persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
    />
  );
}

export function DisabledMenu() {
  const menuItems: MenuItem[] = [
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ];

  return (
    <ButtonMenu
      trigger={{ label: "Menu trigger" }}
      items={menuItems}
      persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
      disabled={true}
    />
  );
}
