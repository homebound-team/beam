import type { Placement } from "@react-types/overlays";
import { ReactNode, useRef } from "react";
import { useMenuTrigger, useOverlayPosition } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { Button, ButtonProps } from "src/components/Button";
import { DatePickerProps } from "src/components/DatePicker";
import { Icon, IconProps } from "src/components/Icon";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Popover } from "src/components/internal";
import { DatePickerOverlay } from "src/components/internal/DatePickerOverlay";
import { Menu } from "src/components/internal/Menu";
import { Css } from "src/Css";
import { Callback } from "src/types";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface TextButtonTriggerProps extends Pick<ButtonProps, "label" | "variant" | "size" | "icon"> {}
interface IconButtonTriggerProps extends Pick<IconButtonProps, "icon" | "color"> {}

interface ButtonMenuBaseProps {
  trigger: TextButtonTriggerProps | IconButtonTriggerProps;
  // Defaults to "left"
  placement?: "left" | "right";
  // for storybook purposes
  defaultOpen?: boolean;
  /** Whether the Button is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  /** Text to be shown via a tooltip when the user hovers over the button */
  tooltip?: ReactNode;
}

interface ButtonMenuDatePickerProps extends ButtonMenuBaseProps, DatePickerProps {}
interface ButtonMenuItemsProps extends ButtonMenuBaseProps, MenuItemsProps {}

export function ButtonMenu(props: ButtonMenuItemsProps | ButtonMenuDatePickerProps) {
  const { trigger, placement, defaultOpen, disabled, tooltip, ...menuProps } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef(null);
  const { menuTriggerProps, menuProps: ariaMenuProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: buttonRef,
    overlayRef: popoverRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: (placement ? `bottom ${placement}` : "bottom left") as Placement,
  });
  const tid = useTestIds(props, isTextButton(trigger) ? defaultTestId(trigger.label) : trigger.icon);

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
          tooltip={tooltip}
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
          {isMenuItemProps(menuProps) ? (
            <Menu ariaMenuProps={ariaMenuProps} onClose={() => state.close()} {...menuProps} {...tid} />
          ) : (
            <DatePickerOverlay
              {...menuProps}
              onSelect={(d) => {
                state.close();
                menuProps.onSelect(d);
              }}
            />
          )}
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

// Making a separate interface to make it easier for comparing prop types against.
interface MenuItemsProps {
  items: MenuItem[];
  persistentItems?: MenuItem[];
}

function isMenuItemProps(props: MenuItemsProps | DatePickerProps): props is MenuItemsProps {
  return typeof props === "object" && "items" in props;
}
