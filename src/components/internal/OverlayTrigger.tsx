import { AriaButtonProps } from "@react-types/button";
import type { Placement } from "@react-types/overlays";
import { MutableRefObject, ReactElement, ReactNode, useRef } from "react";
import { useOverlayPosition } from "react-aria";
import { MenuTriggerState } from "react-stately";
import { Button, ButtonProps } from "src/components/Button";
import { Icon } from "src/components/Icon";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Popover } from "src/components/internal";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface TextButtonTriggerProps extends Pick<ButtonProps, "label" | "variant" | "size" | "icon"> {}
interface IconButtonTriggerProps extends Pick<IconButtonProps, "icon" | "color"> {}

export interface OverlayTriggerProps {
  trigger: TextButtonTriggerProps | IconButtonTriggerProps;
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
          {children}
        </Popover>
      )}
    </div>
  );
}

export function isTextButton(
  trigger: TextButtonTriggerProps | IconButtonTriggerProps,
): trigger is TextButtonTriggerProps {
  return trigger && typeof trigger === "object" && "label" in trigger;
}
