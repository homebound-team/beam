import { ReactNode, useRef } from "react";
import { FocusScope, useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { IconProps } from "src/components/Icon";
import { Menu } from "src/components/internal/Menu";
import {
  isIconButton,
  isItemsProps,
  isTextButton,
  OverlayTrigger,
  OverlayTriggerProps,
} from "src/components/internal/OverlayTrigger";
import { useTestIds } from "src/utils";
import { Css } from "../Css";

export interface ButtonMenuProps extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  items: MenuItem[];
  persistentItems?: MenuItem[];
  // for storybook purposes
  defaultOpen?: boolean;
}

export interface ContextualModalProps {
  content: ReactNode;
  title?: string;
  // for storybook purposes
  defaultOpen?: boolean;
}

type Props = ButtonMenuProps | ContextualModalProps;

export function ButtonMenu(props: Props) {
  const { defaultOpen, disabled, items, persistentItems, trigger } = props as ButtonMenuProps;
  const { content, title } = props as ContextualModalProps;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? trigger.label : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  return (
    <OverlayTrigger
      {...props}
      menuTriggerProps={menuTriggerProps}
      state={state}
      buttonRef={buttonRef}
      {...tid}
      trigger={trigger}
    >
      {isItemsProps(props as ButtonMenuProps) ? (
        <Menu
          ariaMenuProps={menuProps}
          onClose={() => state.close()}
          items={items}
          persistentItems={persistentItems}
          {...tid}
        />
      ) : (
        <ContextualModal content={content} title={title} />
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

export function ContextualModal(props: ContextualModalProps) {
  const { content, title } = props;
  return (
    <FocusScope restoreFocus autoFocus>
      <div css={Css.p3.df.fdc.myPx(4).gap3.bgWhite.bshModal.br4.maxh("inherit").overflowAuto.$}>
        {title && (
          <div css={Css.lg.tc.$} data-testid={title}>
            {title}
          </div>
        )}
        <div data-testid={content}>{content}</div>
      </div>
    </FocusScope>
  );
}
