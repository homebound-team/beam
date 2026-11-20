import { type ReactNode, useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import {
  isIconButton,
  isNavLinkButton,
  isTextButton,
  labelOr,
  OverlayTrigger,
  type OverlayTriggerProps,
} from "src/components/internal/OverlayTrigger";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";
import type { ButtonVariant } from "./Button";
import { ContextualModal } from "./internal/ContextualModal";

export type ButtonModalProps = {
  /** A function receives `close`, so the content can dismiss the popup itself. */
  content: ReactNode | ((close: () => void) => ReactNode);
  /** Centered heading above the content. */
  title?: string;
  /** Variant for a text-button trigger when `trigger` does not set one. Defaults to `secondary`. */
  variant?: ButtonVariant;
  /** Opens the popup on mount, for stories. */
  storybookDefaultOpen?: boolean;
  /** Hides the open/closed chevron on a text-button trigger. */
  hideEndAdornment?: boolean;
} & Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip" | "showActiveBorder">;

/** A button that opens a small popup anchored to it, for short forms or details that don't need a full `Modal`. */
export function ButtonModal(props: ButtonModalProps) {
  const { storybookDefaultOpen, trigger, disabled, content, title } = props;
  const state = useMenuTriggerState({ isOpen: storybookDefaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger)
      ? labelOr(trigger, "buttonModal")
      : isNavLinkButton(trigger)
        ? defaultTestId(trigger.navLabel)
        : isIconButton(trigger)
          ? trigger.icon
          : trigger.name,
  );

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      <ContextualModal content={content} title={title} close={state.close} />
    </OverlayTrigger>
  );
}
