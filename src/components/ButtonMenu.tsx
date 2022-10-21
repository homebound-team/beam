import { values } from "mobx";
import { useRef, useState } from "react";
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
import { Css } from "src/Css";
import { TextField } from "src/inputs";
import { useTestIds } from "src/utils";

interface ButtonMenuProps extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  items: MenuItem[];
  persistentItems?: MenuItem[];
  searchable? : boolean;
  // for storybook purposes
  defaultOpen?: boolean;
}

export function ButtonMenu(props: ButtonMenuProps) {
  const { defaultOpen, disabled, items, persistentItems, trigger, searchable } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const [searchTerm, setSearchTerm] = useState<string | undefined>("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? trigger.label : isIconButton(trigger) ? trigger.icon : trigger.name,
  );
  
  // filter our items by our search term
  const filteredItems = searchTerm ? match(searchTerm, items) : items;


  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      { searchable && (
          <TextField placeholder="Search" value={searchTerm} onChange={setSearchTerm} label="" />
      )}
      <Menu
        ariaMenuProps={menuProps}
        onClose={() => state.close()}
        items={filteredItems}
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

function match(term: string, items: MenuItem[]) {
  const builtExp = Array.from(term).reduce((prevVal, curVal, i) => `${prevVal}[^${term.substr(i)}]*?${curVal}`, '');
  const re = RegExp(builtExp);
  return items.filter(({ label }) => label.toLowerCase().match(re));
}