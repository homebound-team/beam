import { ReactNode, useRef } from "react";
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
import { ContextualModal } from "./internal/ContextualModal";

export interface ButtonMenuBaseProps
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  // for storybook purposes
  defaultOpen?: boolean;
}
export interface WithMenuItemsProps extends ButtonMenuBaseProps {
  items: MenuItem[];
  persistentItems?: MenuItem[];
}

export interface WithContextualModalProps extends ButtonMenuBaseProps {
  content: ReactNode;
  title?: string;
}

export function ButtonMenu(props: WithMenuItemsProps | WithContextualModalProps) {
  // only destructing like properties
  const { defaultOpen, trigger, disabled } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? trigger.label : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      {isWithMenuItemProps(props) ? (
        <Menu
          ariaMenuProps={menuProps}
          onClose={() => state.close()}
          items={props.items}
          persistentItems={props.persistentItems}
          {...tid}
        />
      ) : (
        <ContextualModal content={props.content} title={props.title} trigger={trigger} />
      )}
    </OverlayTrigger>
  );
}

type MenuItemBase = {
  label: string;
  // If the `onClick` property is set as a string, then the menu item will be rendered as a link with the `onClick` value being the href
  onClick: string | VoidFunction;
  disabled?: boolean;
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

// Typeguard for menu items to conditionally render inside ButtonMenu
export function isWithMenuItemProps(props: WithMenuItemsProps | ButtonMenuBaseProps): props is WithMenuItemsProps {
  return "items" in props && typeof props === "object";
}
