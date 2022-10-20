import { AriaButtonProps } from "@react-types/button";
import type { Placement } from "@react-types/overlays";
import { MutableRefObject, ReactElement, ReactNode, useRef } from "react";
import { useOverlayPosition } from "react-aria";
import { MenuTriggerState } from "react-stately";
import { AvatarButton, AvatarButtonProps } from "src/components/AvatarButton";
import { Button, ButtonProps } from "src/components/Button";
import { Icon } from "src/components/Icon";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Popover } from "src/components/internal";
import { Css } from "src/Css";
import { noop, useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { ButtonMenuProps } from "../ButtonMenu";

interface TextButtonTriggerProps extends Pick<ButtonProps, "label" | "variant" | "size" | "icon"> {}
interface IconButtonTriggerProps extends Pick<IconButtonProps, "icon" | "color" | "compact" | "contrast"> {}
interface AvatarButtonTriggerProps extends Pick<AvatarButtonProps, "src" | "name" | "size"> {}

export interface OverlayTriggerProps {
  trigger: TextButtonTriggerProps | IconButtonTriggerProps | AvatarButtonTriggerProps;
  /** Defaults to "left" */
  placement?: "left" | "right";
  /** Whether the Button is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  /** Text to be shown via a tooltip when the user hovers over the button */
  tooltip?: ReactNode;
  /** The component to be shown within the overlay */
  children: ReactElement;
  /** Props returned by the useMenuTrigger hook to be passed to the button element */
  menuTriggerProps: AriaButtonProps;
  /** Ref for the button element */
  buttonRef: MutableRefObject<HTMLButtonElement | null>;
  /** Result of the useMenuTriggerState hook */
  state: MenuTriggerState;
}

export function OverlayTrigger(props: OverlayTriggerProps) {
  const { trigger, buttonRef, menuTriggerProps, placement, state, disabled, tooltip, children } = props;
  const popoverRef = useRef(null);
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: buttonRef,
    overlayRef: popoverRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: (placement ? `bottom ${placement}` : "bottom left") as Placement,
  });
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? defaultTestId(trigger.label) : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

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
          onClick={noop}
          {...tid}
        />
      ) : isIconButton(trigger) ? (
        <IconButton
          {...trigger}
          menuTriggerProps={menuTriggerProps}
          buttonRef={buttonRef}
          {...tid}
          disabled={disabled}
          tooltip={tooltip}
          onClick={noop}
        />
      ) : (
        <AvatarButton
          {...trigger}
          menuTriggerProps={menuTriggerProps}
          buttonRef={buttonRef}
          {...tid}
          disabled={disabled}
          tooltip={tooltip}
          onClick={noop}
        />
      )}
      {state.isOpen && (
        <Popover
          triggerRef={buttonRef}
          popoverRef={popoverRef}
          positionProps={positionProps}
          onClose={() => state.close()}
          isOpen={state.isOpen}
        >
          {children}
        </Popover>
      )}
    </div>
  );
}

export function isTextButton(
  trigger: TextButtonTriggerProps | IconButtonTriggerProps | AvatarButtonTriggerProps,
): trigger is TextButtonTriggerProps {
  return trigger && typeof trigger === "object" && "label" in trigger;
}
export function isIconButton(
  trigger: TextButtonTriggerProps | IconButtonTriggerProps | AvatarButtonTriggerProps,
): trigger is IconButtonTriggerProps {
  return trigger && typeof trigger === "object" && "icon" in trigger;
}

// adding typeguard for items in props to conditionally render inside ButtonMenu
export function isItemsProps(props: ButtonMenuProps): props is ButtonMenuProps {
  return "items" in props && typeof props === "object";
}
