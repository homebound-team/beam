import { AriaButtonProps } from "@react-types/button";
import type { Placement } from "@react-types/overlays";
import { MutableRefObject, ReactElement, ReactNode, useRef } from "react";
import { useOverlayPosition } from "react-aria";
import { MenuTriggerState } from "react-stately";
import { AvatarButton, AvatarButtonProps } from "src/components/Avatar/AvatarButton";
import { Button, ButtonProps, ButtonVariant } from "src/components/Button";
import { Icon } from "src/components/Icon";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Popover } from "src/components/internal";
import { NavLink, NavLinkProps } from "src/components/NavLink";
import { Css } from "src/Css";
import { noop, useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface TextButtonTriggerProps extends Pick<ButtonProps, "label" | "variant" | "size" | "icon"> {}
interface IconButtonTriggerProps extends Pick<IconButtonProps, "icon" | "color" | "compact" | "contrast"> {}
interface AvatarButtonTriggerProps extends Pick<AvatarButtonProps, "src" | "name" | "size"> {}
interface NavLinkButtonTriggerProps extends Pick<NavLinkProps, "active" | "variant" | "icon"> {
  navLabel: string;
}

export interface OverlayTriggerProps {
  trigger: TextButtonTriggerProps | IconButtonTriggerProps | AvatarButtonTriggerProps | NavLinkButtonTriggerProps;
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
  /** Prop set the style of the button element */
  variant?: ButtonVariant;
  hideEndAdornment?: boolean;
  showActiveBorder?: boolean;
  contrast?: boolean;
}

export function OverlayTrigger(props: OverlayTriggerProps) {
  const {
    trigger,
    buttonRef,
    menuTriggerProps,
    placement,
    state,
    disabled,
    tooltip,
    children,
    variant,
    hideEndAdornment,
    showActiveBorder = false,
    contrast = false,
  } = props;
  const popoverRef = useRef(null);
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: buttonRef,
    overlayRef: popoverRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: (placement ? `bottom ${placement}` : "bottom left") as Placement,
    offset: showActiveBorder ? 4 : undefined,
  });
  const tid = useTestIds(
    props,
    isTextButton(trigger)
      ? defaultTestId(labelOr(trigger, "overlayTrigger"))
      : isNavLinkButton(trigger)
      ? defaultTestId(trigger.navLabel)
      : isIconButton(trigger)
      ? trigger.icon
      : trigger.name,
  );

  return (
    <div css={Css.relative.dib.$}>
      {isTextButton(trigger) ? (
        <Button
          variant={variant ? variant : "secondary"}
          contrast={contrast}
          {...trigger}
          menuTriggerProps={menuTriggerProps}
          buttonRef={buttonRef}
          endAdornment={!hideEndAdornment ? <Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} /> : null}
          disabled={disabled}
          tooltip={tooltip}
          onClick={menuTriggerProps.onPress ?? noop}
          forceFocusStyles={showActiveBorder && state.isOpen}
          {...tid}
        />
      ) : isNavLinkButton(trigger) ? (
        <NavLink
          {...trigger}
          label={trigger.navLabel}
          disabled={!!disabled}
          contrast={contrast}
          menuTriggerProps={menuTriggerProps}
          buttonRef={buttonRef}
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
          onClick={menuTriggerProps.onPress ?? noop}
          forceFocusStyles={showActiveBorder && state.isOpen}
        />
      ) : (
        <AvatarButton
          {...trigger}
          menuTriggerProps={menuTriggerProps}
          buttonRef={buttonRef}
          {...tid}
          disabled={disabled}
          tooltip={tooltip}
          onClick={menuTriggerProps.onPress ?? noop}
          forceFocusStyles={showActiveBorder && state.isOpen}
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
  trigger: TextButtonTriggerProps | IconButtonTriggerProps | AvatarButtonTriggerProps | NavLinkButtonTriggerProps,
): trigger is TextButtonTriggerProps {
  return trigger && typeof trigger === "object" && "label" in trigger;
}
export function isIconButton(
  trigger: TextButtonTriggerProps | IconButtonTriggerProps | AvatarButtonTriggerProps | NavLinkButtonTriggerProps,
): trigger is IconButtonTriggerProps {
  return trigger && typeof trigger === "object" && "icon" in trigger;
}

export function isNavLinkButton(
  trigger: TextButtonTriggerProps | IconButtonTriggerProps | AvatarButtonTriggerProps | NavLinkButtonTriggerProps,
): trigger is NavLinkButtonTriggerProps {
  return trigger && typeof trigger === "object" && "navLabel" in trigger;
}

export function labelOr(trigger: { label: unknown }, fallback: string): string {
  return typeof trigger.label === "string" ? trigger.label : fallback;
}
