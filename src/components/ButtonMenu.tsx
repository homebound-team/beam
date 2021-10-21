import type { Placement } from "@react-types/overlays";
import { camelCase } from "change-case";
import { useEffect, useRef } from "react";
import { DismissButton, useMenuTrigger, useOverlayPosition } from "react-aria";
import { Item, Section, useMenuTriggerState, useTreeData } from "react-stately";
import { Button, ButtonProps } from "src/components/Button";
import { Icon, IconProps } from "src/components/Icon";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Popover } from "src/components/internal";
import { Menu } from "src/components/internal/Menu";
import { Css } from "src/Css";
import { Callback } from "src/types";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface TextButtonTriggerProps extends Pick<ButtonProps, "label" | "variant" | "size" | "icon"> {}
interface IconButtonTriggerProps extends Pick<IconButtonProps, "icon" | "color"> {}

interface ButtonMenuProps {
  trigger: TextButtonTriggerProps | IconButtonTriggerProps;
  items: MenuItem[];
  persistentItems?: MenuItem[];
  // Defaults to "left"
  placement?: "left" | "right";
  // for storybook purposes
  defaultOpen?: boolean;
  disabled?: boolean;
}

export function ButtonMenu(props: ButtonMenuProps) {
  const { trigger, items, placement, persistentItems, defaultOpen, disabled } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef(null);
  const { menuTriggerProps, menuProps: ariaMenuProps } = useMenuTrigger({ isDisabled: disabled }, state, buttonRef);
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: buttonRef,
    overlayRef: popoverRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: (placement ? `bottom ${placement}` : "bottom left") as Placement,
  });
  const tid = useTestIds(props, isTextButton(trigger) ? defaultTestId(trigger.label) : trigger.icon);

  // Build out the Menu's Tree data to include the Persistent Action, if any. This is a collection of Nodes that is used
  // by React-Aria to keep track of item states such as focus, and provide hooks for calling those actions.
  const tree = useTreeData({
    initialItems: [items, persistentItems ? persistentItems : []].flatMap((i, idx) =>
      i.length > 0 ? ([{ label: idx === 0 ? "items" : "persistent", items: i }] as MenuSection[]) : ([] as MenuItem[]),
    ),
    getKey: (item) => camelCase(item.label),
    getChildren: (item) => (item as MenuSection).items ?? [],
  });

  // Bulk updates of MenuItems below. If we find this to be of sluggish performance, then we can change to be more surgical in our updating.
  // If our list of items change, update the "items" menu section. (key is based on label in `getKey` above)
  useEffect(() => tree.update("items", { label: "items", items } as MenuSection), [items]);

  // NOTE: Not updating persistentItems at the moment as there seems to be a bug with this. Only updates one set of items at a time, will follow up later.
  // If our list of persistentItems change, update the "persistent" menu section.
  // useEffect(() => {
  //   tree.update("persistent", { label: "persistent", items: persistentItems || [] } as MenuSection);
  // }, [persistentItems]);

  return (
    <div css={Css.relative.dib.$}>
      {isTextButton(trigger) ? (
        <Button
          variant="secondary"
          {...trigger}
          menuTriggerProps={menuTriggerProps}
          buttonRef={buttonRef}
          endAdornment={<Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} />}
          disabled={disabled}
          {...tid}
        />
      ) : (
        <IconButton {...trigger} menuTriggerProps={menuTriggerProps} buttonRef={buttonRef} {...tid} />
      )}
      {state.isOpen && (
        <Popover
          triggerRef={buttonRef}
          popoverRef={popoverRef}
          positionProps={positionProps}
          onClose={() => state.close()}
          isOpen={state.isOpen}
        >
          <Menu ariaMenuProps={ariaMenuProps} items={tree.items} onClose={() => state.close()} {...tid}>
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
  disabled?: boolean;
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
