import { Meta } from "@storybook/react";
import { useState } from "react";
import { ButtonMenu } from "src/components/ButtonMenu";
import { Menu } from "src/components/internal/Menu";
import { noop } from "src/utils";
import { withDimensions, withRouter } from "src/utils/sb";

export default {
  component: Menu,
  title: "Workspace/Components/Menu",
  decorators: [withDimensions(), withRouter()],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36062%3A105697",
    },
  },
} as Meta;


export function BasicMenuItems() {
  return (
    <ButtonMenu
      defaultOpen
      trigger={{ label: "Menu Trigger" }}
      items={[
        { label: "Menu item 1", onClick: "/"},
        { label: "Menu item 2", onClick: "https://google.com" },
        { label: "Menu item 3", onClick: noop, disabled: true },
        { label: "Menu item 4", onClick: noop },
        { label: "Destructive menu item", onClick: noop, destructive: true },
      ]}
    />
  );
}

export function BasicMenuItemsClose() {
  return (
    <ButtonMenu
      trigger={{ label: "Menu Trigger" }}
      items={[
        { label: "Menu item 1", onClick: "?test=true" },
        { label: "Menu item 2", onClick: "https://google.com" },
        { label: "Menu item 3", onClick: noop, disabled: true },
        { label: "Menu item 4", onClick: noop },
        { label: "Destructive menu item", onClick: noop, destructive: true },
      ]}
    />
  );
}

export function IconMenuItems() {
  return (
    <ButtonMenu
      defaultOpen
      trigger={{ label: "Menu Trigger" }}
      items={[
        { label: "Edit", icon: "pencil", onClick: noop },
        { label: "Like", icon: "thumbsUp", onClick: noop },
        { label: "Favorite", icon: "star", onClick: noop },
        { label: "Delete", icon: "trash", onClick: noop, destructive: true },
      ]}
    />
  );
}

export function AvatarMenuItems() {
  return (
    <ButtonMenu
      defaultOpen
      trigger={{ label: "Menu Trigger" }}
      items={[
        {
          label: "Iron man",
          src: "tony-stark.jpg",
          isAvatar: true,
          onClick: noop,
        },
        {
          label: "Captain Marvel",
          src: "captain-marvel.jpg",
          isAvatar: true,
          onClick: noop,
        },
        {
          label: "Captain America",
          src: "captain-america.jpg",
          isAvatar: true,
          onClick: noop,
        },
        {
          label: "Thor",
          src: "thor.jpg",
          isAvatar: true,
          onClick: noop,
        },
        {
          label: "Black Widow",
          src: "/black-widow.jpg",
          isAvatar: true,
          onClick: noop,
        },
      ]}
    />
  );
}

export function ImageMenuItems() {
  return (
    <ButtonMenu
      defaultOpen
      trigger={{ label: "Menu Trigger" }}
      items={[
        {
          label: 'KitchenAid 30" French Door Standard Depth Refrigerator',
          src: "/fridge.jpeg",
          size: 48,
          onClick: noop,
        },
        {
          label: 'KitchenAid 36" Counter Depth French Door Refrigerator',
          src: "/fridge2.jpeg",
          size: 48,
          onClick: noop,
        },
        {
          label: "Piedrafina BellaQuartz Premium Series Countertop",
          src: "/counter-top.jpeg",
          size: 48,
          onClick: noop,
        },
        {
          label: "Some sort of fancy fireplace and mantel",
          src: "/fireplace.jpeg",
          size: 48,
          onClick: noop,
        },
      ]}
    />
  );
}

export function WithSelections() {
  const [selected, setSelected] = useState("Captain Marvel");
  return (
    <ButtonMenu
      defaultOpen
      trigger={{ label: "Menu Trigger" }}
      selectedItem={selected}
      onChange={setSelected}
      items={[
        { label: "Iron man", src: "tony-stark.jpg", isAvatar: true, onClick: noop },
        { label: "Captain Marvel", src: "captain-marvel.jpg", isAvatar: true, onClick: noop },
        { label: "Captain America", src: "captain-america.jpg", isAvatar: true, onClick: noop },
        { label: "Thor", src: "thor.jpg", isAvatar: true, onClick: noop },
        { label: "Black Widow", src: "/black-widow.jpg", isAvatar: true, onClick: noop },
      ]}
    />
  );
}
