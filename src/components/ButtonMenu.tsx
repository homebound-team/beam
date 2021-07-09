import { Item } from "@react-stately/collections";
import { Placement } from "@react-types/overlays";
import { CollectionChildren, Node } from "@react-types/shared";
import React, { HTMLAttributes, useRef } from "react";
import { DismissButton, useMenuItem, useMenuTrigger, useOverlayPosition } from "react-aria";
import { useHistory } from "react-router";
import { TreeState, useMenuTriggerState, useTreeState } from "react-stately";
import { Button, ButtonProps } from "src/components/Button";
import { Icon } from "src/components/Icon";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { MenuItem, Popover } from "src/components/internal";
import { Menu } from "src/components/internal/Menu";
import { MenuItemType } from "src/components/internal/MenuItem";
import { Css } from "src/Css";
import { Callback } from "src/types";
import { isAbsoluteUrl } from "src/utils";

interface ActionMenuProps {
  items: MenuItemType[];
  // Defaults to "bottom start"
  placement?: Placement;
  persistentAction?: MenuItemType;
}

interface TextButtonTriggerProps extends Pick<ButtonProps, "label" | "variant" | "size" | "icon"> {}
interface IconButtonTriggerProps extends Pick<IconButtonProps, "icon" | "color"> {}

interface ButtonMenuProps {
  triggerProps: TextButtonTriggerProps | IconButtonTriggerProps;
  menuProps: ActionMenuProps;
}

export function ButtonMenu({ triggerProps, menuProps }: ButtonMenuProps) {
  const state = useMenuTriggerState({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef(null);
  const { menuTriggerProps, menuProps: ariaMenuProps } = useMenuTrigger({}, state, buttonRef);
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: buttonRef,
    overlayRef: popoverRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: menuProps.placement || "bottom start",
  });

  return (
    <div css={Css.relative.dib.$}>
      {isTextButton(triggerProps) ? (
        <Button
          variant="secondary"
          {...triggerProps}
          menuTriggerProps={menuTriggerProps}
          buttonRef={buttonRef}
          endAdornment={<Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} />}
        />
      ) : (
        <IconButton {...triggerProps} menuTriggerProps={menuTriggerProps} buttonRef={buttonRef} />
      )}
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          positionProps={positionProps}
          onClose={() => state.close()}
          isOpen={state.isOpen}
        >
          <ButtonMenuMenu ariaMenuProps={ariaMenuProps} items={menuProps.items} onClose={() => state.close()}>
            {(item) => <Item key={item.label}>{item.label}</Item>}
          </ButtonMenuMenu>
          <DismissButton onDismiss={() => state.close()} />
        </Popover>
      )}
    </div>
  );
}

interface ButtonMenuMenuProps {
  ariaMenuProps: HTMLAttributes<HTMLElement>;
  children: CollectionChildren<MenuItemType>;
  items: MenuItemType[];
  onClose: Callback;
}
function ButtonMenuMenu(props: ButtonMenuMenuProps) {
  const state = useTreeState({ ...props, selectionMode: "none" });
  return (
    <Menu ariaMenuProps={props.ariaMenuProps} state={state}>
      {[...state.collection].map((item) => (
        <ButtomMenuItem key={item.key} item={item} state={state} onClose={props.onClose} />
      ))}
    </Menu>
  );
}

interface ButtomMenuItemProps {
  item: Node<MenuItemType>;
  state: TreeState<MenuItemType>;
  onClose: Callback;
}

function ButtomMenuItem(props: ButtomMenuItemProps) {
  const { item, state, onClose } = props;
  const isFocused = state.selectionManager.focusedKey === item.key;
  const ref = useRef<HTMLLIElement>(null);
  const history = useHistory();
  const { menuItemProps } = useMenuItem(
    {
      key: item.key,
      onAction: () => {
        const { onClick } = item.value;
        if (typeof onClick === "string") {
          // if it is an absolute URL, then open in new window. Assuming this should leave the App
          if (isAbsoluteUrl(onClick)) {
            window.open(onClick, "_blank", "noopener,noreferrer");
            return;
          }

          // Otherwise, it is a relative URL and we'll assume it is still within the App.
          history.push(onClick);
          return;
        }
        onClick();
      },
      onClose,
    },
    state,
    ref,
  );
  return <MenuItem itemProps={menuItemProps} itemRef={ref} item={item.value} isFocused={isFocused} />;
}

function isTextButton(trigger: TextButtonTriggerProps | IconButtonTriggerProps): trigger is TextButtonTriggerProps {
  return trigger && typeof trigger === "object" && "label" in trigger;
}
