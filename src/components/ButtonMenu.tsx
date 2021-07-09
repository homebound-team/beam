import { Item, Section } from "@react-stately/collections";
import React, { useRef } from "react";
import { DismissButton, useMenuTrigger, useOverlayPosition } from "react-aria";
import { useMenuTriggerState, useTreeData } from "react-stately";
import { Button, ButtonProps } from "src/components/Button";
import { Icon, IconProps } from "src/components/Icon";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Popover } from "src/components/internal";
import { Menu } from "src/components/internal/Menu";
import { Css } from "src/Css";
import { Callback } from "src/types";

interface TextButtonTriggerProps extends Pick<ButtonProps, "label" | "variant" | "size" | "icon"> {}
interface IconButtonTriggerProps extends Pick<IconButtonProps, "icon" | "color"> {}

interface ButtonMenuProps {
  trigger: TextButtonTriggerProps | IconButtonTriggerProps;
  items: MenuItem[];
  // Defaults to "bottom start"
  placement?: "bottom left" | "bottom right" | "top left" | "top right";
  persistentActions?: MenuItem[];
  // for storybook purposes
  defaultOpen?: boolean;
}

export function ButtonMenu({ trigger, items, placement, persistentActions, defaultOpen }: ButtonMenuProps) {
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef(null);
  const { menuTriggerProps, menuProps: ariaMenuProps } = useMenuTrigger({}, state, buttonRef);
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: buttonRef,
    overlayRef: popoverRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: placement || "bottom left",
  });

  // Build out the Menu's Tree data to include the Persistent Action, if any. This is a collection of Nodes that is used
  // by React-Aria to keep track of item states such as focus, and provide hooks for calling those actions.
  const tree = useTreeData({
    initialItems: [items, persistentActions ? persistentActions : []].flatMap((i, idx) =>
      i.length > 0 ? ([{ label: idx === 0 ? "items" : "persistent", items: i }] as MenuSection[]) : ([] as MenuItem[]),
    ),
    getKey: (item) => item.label.replace(/\"/g, ""),
  });

  return (
    <div css={Css.relative.dib.$}>
      {isTextButton(trigger) ? (
        <Button
          variant="secondary"
          {...trigger}
          menuTriggerProps={menuTriggerProps}
          buttonRef={buttonRef}
          endAdornment={<Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} />}
        />
      ) : (
        <IconButton {...trigger} menuTriggerProps={menuTriggerProps} buttonRef={buttonRef} />
      )}
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          positionProps={positionProps}
          onClose={() => state.close()}
          isOpen={state.isOpen}
        >
          <Menu ariaMenuProps={ariaMenuProps} items={tree.items} onClose={() => state.close()}>
            {(s) => (
              <Section key={s.label.replace(/\"/g, "")} title={s.label} items={s.items}>
                {(item) => <Item key={item.label.replace(/\"/g, "")}>{item.label}</Item>}
              </Section>
            )}
          </Menu>
          <DismissButton onDismiss={() => state.close()} />
        </Popover>
      )}
    </div>
  );
}

function isTextButton(trigger: TextButtonTriggerProps | IconButtonTriggerProps): trigger is TextButtonTriggerProps {
  return trigger && typeof trigger === "object" && "label" in trigger;
}

type MenuItemBase = {
  label: string;
  // If the `onClick` property is set as a string, then the menu item will be rendered as a link with the `onClick` value being the href
  onClick: string | Callback;
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
export type MenuSection = MenuItem & { items?: MenuItem[] };
