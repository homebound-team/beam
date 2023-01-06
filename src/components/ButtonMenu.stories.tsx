import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Button } from "src/components/Button";
import { ButtonMenu, MenuItem } from "src/components/ButtonMenu";
import { Css } from "src/Css";
import { withDimensions, withRouter } from "src/utils/sb";

export default {
  component: ButtonMenu,
  title: "Workspace/Components/Button Menus",
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
        persistentItems={[
          { label: "Persistent Action", onClick: action("Persistent action clicked") },
          { label: "Destructive Action", onClick: action("Destructive Action Clicked"), destructive: true },
        ]}
        defaultOpen
      />

      <div css={Css.mtPx(250).$}>
        <h2 css={Css.lg.$}>Anchored right</h2>
        <div css={Css.mlPx(200).$}>
          <ButtonMenu
            trigger={{ label: "Menu trigger" }}
            items={menuItems}
            persistentItems={[
              { label: "Persistent Action", onClick: action("Persistent action clicked") },
              { label: "Destructive Action", onClick: action("Destructive Action Clicked"), destructive: true },
            ]}
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
  const [persistentItems, setPersistentItems] = useState<MenuItem[]>([
    { label: "Persistent Action", onClick: action("Persistent action clicked") },
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
        <Button
          label="Add New Persistent Item"
          onClick={() =>
            setPersistentItems((prevItems) => [
              ...prevItems,
              {
                label: `Persistent Item ${prevItems.length + 1}`,
                onClick: action(`Persistent Item ${prevItems.length + 1}`),
              },
            ])
          }
        />
      </div>
      <ButtonMenu
        trigger={{ navLabel: "Menu trigger", variant: "global" }}
        items={menuItems}
        persistentItems={persistentItems}
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
      disabled="Disabled reason"
    />
  );
}

export function IconButtonMenu() {
  const menuItems: MenuItem[] = [
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ];

  return (
    <ButtonMenu
      trigger={{ icon: "infoCircle" }}
      defaultOpen
      items={menuItems}
      persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
    />
  );
}

export function ActiveIconButtonMenu() {
  const menuItems: MenuItem[] = [
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ];

  return (
    <ButtonMenu
      trigger={{ icon: "infoCircle" }}
      defaultOpen
      items={menuItems}
      persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
      showActiveBorder
    />
  );
}

export function AvatarButtonMenu() {
  const menuItems: MenuItem[] = [
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ];

  return (
    <ButtonMenu
      trigger={{ src: "tony-stark.jpg", name: "Tony Stark" }}
      defaultOpen
      items={menuItems}
      persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
    />
  );
}

export function AvatarActiveButtonMenu() {
  const menuItems: MenuItem[] = [
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ];

  return (
    <ButtonMenu
      trigger={{ src: "tony-stark.jpg", name: "Tony Stark" }}
      defaultOpen
      items={menuItems}
      persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
      showActiveBorder
    />
  );
}

export function WithTooltip() {
  const menuItems: MenuItem[] = [
    { label: "Menu Item 1", onClick: action("Menu Item 1") },
    { label: "Menu Item 2", onClick: action("Menu Item 2") },
    { label: "Menu Item 3", onClick: action("Menu Item 3") },
  ];

  return <ButtonMenu trigger={{ label: "Menu trigger" }} items={menuItems} tooltip="Tool tip text" />;
}

export function WithSearchListItems() {
  const menuItems: MenuItem[] = [
    { label: "Austin", onClick: action("Austin") },
    { label: "Santa Rosa", onClick: action("Santa Rosa") },
    { label: "Houston", onClick: action("Houston") },
    { label: "Driftwood", onClick: action("Driftwood") },
  ];

  return (
    <ButtonMenu
      defaultOpen
      trigger={{ label: "Select a cohort" }}
      items={menuItems}
      searchable
      persistentItems={[{ label: "Persistent Action", onClick: action("Persistent action clicked") }]}
    />
  );
}

export function IconMenuWtihSearchableList() {
  const menuItems: MenuItem[] = [
    { label: "Design doc", onClick: action("Austin") },
    { label: "Expense report", onClick: action("Expense report") },
    { label: "Training plan", onClick: action("Training plan") },
  ];

  return <ButtonMenu defaultOpen trigger={{ icon: "archive" }} items={menuItems} searchable />;
}

export function NavLinkButtonMenu() {
  const menuItems: MenuItem[] = [
    { label: "Page action", onClick: action("Test item clicked") },
    { label: "Internal Link", onClick: "/fakeRoute" },
    { label: "External Link - Homebound.com", onClick: "https://www.homebound.com" },
  ];

  return (
    <div css={Css.mlPx(200).$}>
      <h2 css={Css.lg.$}>Nav Link Button Menu</h2>
      <ButtonMenu
        trigger={{ navLabel: "Menu trigger", variant: "global" }}
        items={menuItems}
        persistentItems={[
          { label: "Persistent Action", onClick: action("Persistent action clicked") },
          { label: "Destructive Action", onClick: action("Destructive Action Clicked"), destructive: true },
        ]}
        defaultOpen
        contrast={true}
      />
    </div>
  );
}
