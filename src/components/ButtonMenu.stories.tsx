import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Button } from "src/components/Button";
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
    <div css={Css.df.fdc.$}>
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ]);

  return (
    <>
      <div css={Css.df.gap1.mb2.$}>
        <Button
          label="Toggle Disable of first item"
          onClick={() =>
            setMenuItems(([pageAction, ...others]) => [{ ...pageAction, disabled: !pageAction.disabled }, ...others])
          }
        />
        <Button
          label="Add New Menu Item"
          onClick={() =>
            setMenuItems((prevItems) => [
              ...prevItems,
              { label: `Item ${prevItems.length + 1}`, onClick: action(`Item ${prevItems.length + 1}`) },
            ])
          }
        />
      </div>
      <ButtonMenu
        trigger={{ label: "Menu trigger" }}
        items={menuItems}
        persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
      />
    </>
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
