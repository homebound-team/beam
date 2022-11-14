import { ReactNode, useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import {
  isIconButton,
  isTextButton,
  OverlayTrigger,
  OverlayTriggerProps,
} from "src/components/internal/OverlayTrigger";
import { useTestIds } from "src/utils";
import { ButtonVariant } from "./Button";
import { ContextualModal } from "./internal/ContextualModal";

export interface ButtonModalProps
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip" | "showActiveBorder"> {
  content: ReactNode | ((close: () => void) => ReactNode);
  title?: string;
  variant?: ButtonVariant;
  storybookDefaultOpen?: boolean;
  hideEndAdornment?: boolean;
}

export function ButtonModal(props: ButtonModalProps) {
  const { storybookDefaultOpen, trigger, disabled, content, title } = props;
  const state = useMenuTriggerState({ isOpen: storybookDefaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? trigger.label : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      <ContextualModal content={content} title={title} close={state.close} />
    </OverlayTrigger>
  );
}
