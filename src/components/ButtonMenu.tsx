import { ReactNode, useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { IconProps } from "src/components/Icon";
import { Menu } from "src/components/internal/Menu";
import {
  isIconButton,
  isNavLinkButton,
  isTextButton,
  labelOr,
  OverlayTrigger,
  OverlayTriggerProps,
} from "src/components/internal/OverlayTrigger";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface ButtonMenuBaseProps
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip" | "showActiveBorder"> {
  items: MenuItem[];
  persistentItems?: MenuItem[];
  searchable?: boolean;
  // for storybook purposes
  defaultOpen?: boolean;
  contrast?: boolean;
}

interface SelectionButtonMenuProps extends ButtonMenuBaseProps {
  /** Display a menu item as selected based. Use the Menu Item's label to identify */
  selectedItem: string | undefined;
  onChange: (key: string) => void;
}

export function ButtonMenu(props: ButtonMenuBaseProps | SelectionButtonMenuProps) {
  const { defaultOpen, disabled, items, persistentItems, trigger, searchable, contrast = false } = props;

  let selectedItem, onChange;
  if (isSelectionButtonMenuProps(props)) {
    selectedItem = props.selectedItem;
    onChange = props.onChange;
  }

  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger)
      ? labelOr(trigger, "buttonMenu")
      : isNavLinkButton(trigger)
      ? defaultTestId(trigger.navLabel)
      : isIconButton(trigger)
      ? trigger.icon
      : trigger.name,
  );

  return (
    <OverlayTrigger
      {...props}
      menuTriggerProps={menuTriggerProps}
      state={state}
      buttonRef={buttonRef}
      {...tid}
      contrast={contrast}
    >
      <Menu
        ariaMenuProps={menuProps}
        onClose={() => state.close()}
        items={items}
        persistentItems={persistentItems}
        searchable={searchable}
        contrast={contrast}
        selectedItem={selectedItem}
        onChange={onChange}
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

function isSelectionButtonMenuProps(
  props: ButtonMenuBaseProps | SelectionButtonMenuProps,
): props is SelectionButtonMenuProps {
  return typeof props === "object" && "selectedItem" in props && "onChange" in props;
}
