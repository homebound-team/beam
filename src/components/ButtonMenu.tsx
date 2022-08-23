import { useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { IconProps } from "src/components/Icon";
import { Menu } from "src/components/internal/Menu";
import {
  isIconButton,
  isTextButton,
  OverlayTrigger,
  OverlayTriggerProps,
} from "src/components/internal/OverlayTrigger";
import { useTestIds } from "src/utils";

interface ButtonMenuProps extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  items: MenuItem[];
  persistentItems?: MenuItem[];
  // for storybook purposes
  defaultOpen?: boolean;
}

export function ButtonMenu(props: ButtonMenuProps) {
  const { defaultOpen, disabled, items, persistentItems, trigger } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? trigger.label : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      <Menu
        ariaMenuProps={menuProps}
        onClose={() => state.close()}
        items={items}
        persistentItems={persistentItems}
        {...tid}
      />
    </OverlayTrigger>
  );
}

type MenuItemBase = {
  label: string;
  // If the `onClick` property is set as a string, then the menu item will be rendered as a link with the `onClick` value being the href
  onClick: string | VoidFunction;
  disabled?: boolean;
  destructive?: boolean;
  /** If using a string as the onClick value, and setting this to true will force the browser to open the link in the same browser window as a new tab */
  forceSameBrowserTab?: boolean;
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
