import { AriaButtonProps } from "@react-types/button";
import type { Placement } from "@react-types/overlays";
import type { PressEvent } from "@react-types/shared";
import { MutableRefObject, ReactElement, ReactNode, useMemo, useRef } from "react";
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
interface IconButtonTriggerProps extends Pick<IconButtonProps, "icon" | "color" | "compact" | "contrast" | "inc"> {}
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

// FIXME: The `popover` doesn't automatically get focus in all use cases so we cant tab through inputs/buttons immediately without
// a second click on the popover
// - EX: EditColumnsButton
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
  // react-aria v3.33+ changed useMenuTrigger so that mouse/virtual clicks call state.open() instead
  // of state.toggle(), breaking click-to-close behavior (specifically for our rtl-utils `click(...)`
  // helper which uses lighter-weight virtual events instead of real mouse events).
  // Override onPressStart to restore the toggle-on-click behavior for all pointer types.
  const wrappedMenuTriggerProps = useMemo<AriaButtonProps>(
    () => ({
      ...menuTriggerProps,
      onPressStart: (e: PressEvent) => {
        if (e.pointerType !== "touch" && e.pointerType !== "keyboard") {
          // Mouse/virtual clicks should toggle, not just open
          state.toggle(e.pointerType === "virtual" ? "first" : null);
        } else {
          menuTriggerProps.onPressStart?.(e);
        }
      },
    }),
    [menuTriggerProps, state],
  );

  const popoverRef = useRef(null);
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: buttonRef,
    overlayRef: popoverRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: (placement ? `bottom ${placement}` : "bottom left") as Placement,
    offset: showActiveBorder ? 4 : undefined,
    // Prevents a react-aria ResizeObserver loop that prevents full scrollability in menus
    // that scroll when the trigger is inside a virtual GridTable with nested
    // scroll containers (e.g. stepper + layout + virtuoso), and the trigger is far
    // enough from the viewport edge that the calculated maxHeight differs significantly
    // This is a very specific set of circumstances that have appeared w/in blueprint
    // after we upgraded truss to v2
    maxHeight: window.visualViewport?.height ?? window.innerHeight,
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
    // Add `line-height: 0` to prevent the Icon button and Avatar buttons from inheriting the line-height, causing them to be taller than they should.
    <div css={Css.dib.add("lineHeight", 0).$}>
      {isTextButton(trigger) ? (
        <Button
          variant={variant ? variant : "secondary"}
          contrast={contrast}
          {...trigger}
          menuTriggerProps={wrappedMenuTriggerProps}
          buttonRef={buttonRef}
          endAdornment={!hideEndAdornment ? <Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} /> : null}
          disabled={disabled}
          tooltip={tooltip}
          onClick={wrappedMenuTriggerProps.onPress ?? noop}
          forceFocusStyles={showActiveBorder && state.isOpen}
          {...tid}
        />
      ) : isNavLinkButton(trigger) ? (
        <NavLink
          {...trigger}
          label={trigger.navLabel}
          disabled={!!disabled}
          contrast={contrast}
          menuTriggerProps={wrappedMenuTriggerProps}
          buttonRef={buttonRef}
          {...tid}
        />
      ) : isIconButton(trigger) ? (
        <IconButton
          {...trigger}
          menuTriggerProps={wrappedMenuTriggerProps}
          buttonRef={buttonRef}
          {...tid}
          disabled={disabled}
          tooltip={tooltip}
          onClick={wrappedMenuTriggerProps.onPress ?? noop}
          forceFocusStyles={showActiveBorder && state.isOpen}
        />
      ) : (
        <AvatarButton
          {...trigger}
          menuTriggerProps={wrappedMenuTriggerProps}
          buttonRef={buttonRef}
          {...tid}
          disabled={disabled}
          tooltip={tooltip}
          onClick={wrappedMenuTriggerProps.onPress ?? noop}
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
