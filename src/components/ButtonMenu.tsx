import { ReactNode, useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { IconProps } from "src/components/Icon";
import { Menu } from "src/components/internal/Menu";
import {
  isIconButton,
  isTextButton,
  labelOr,
  OverlayTrigger,
  OverlayTriggerProps,
} from "src/components/internal/OverlayTrigger";
import { useTestIds } from "src/utils";
import { ButtonVariant } from "./Button";

interface ButtonMenuProps
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip" | "showActiveBorder"> {
  items: MenuItem[];
  persistentItems?: MenuItem[];
  searchable?: boolean;
  // for storybook purposes
  defaultOpen?: boolean;
  variant?: ButtonVariant;
  contrast?: boolean;
}

export function ButtonMenu(props: ButtonMenuProps) {
  const { defaultOpen, disabled, items, persistentItems, trigger, searchable, variant, contrast = false } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? labelOr(trigger, "buttonMenu") : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  return (
    <OverlayTrigger
      {...props}
      menuTriggerProps={menuTriggerProps}
      state={state}
      buttonRef={buttonRef}
      {...tid}
      variant={variant}
      contrast={contrast}
    >
      <Menu
        ariaMenuProps={menuProps}
        onClose={() => state.close()}
        items={items}
        persistentItems={persistentItems}
        searchable={searchable}
        contrast={contrast}
        {...tid}
      />
    </OverlayTrigger>
  );
}

type MenuItemBase = {
  label: string;
  /** If the `onClick` property is set as a string, then the menu item will be rendered as a link with the `onClick` value being the href */
  onClick: string | VoidFunction;
  /** Whether the interactive element is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  destructive?: boolean;
};

export type IconMenuItemType = MenuItemBase & {
  icon: IconProps["icon"];
};

export type ImageMenuItemType = MenuItemBase & {
  src: string;
  size?: 24 | 48;
  isAvatar?: boolean;
};

export type MenuItem = MenuItemBase | IconMenuItemType | ImageMenuItemType;
// This is done just to adapt to the React-Aria API for generating Sectioned lists of Menu Items.
export type MenuSection = MenuItem & { items?: MenuItem[] };
