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
import { ContextualModal } from "./internal/ContextualModal";

export interface WithContextualModalProps
  extends Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  content: ReactNode;
  title?: string;
  // for storybook purposes
  defaultOpen?: boolean;
}

export function ButtonModal(props: WithContextualModalProps) {
  const { defaultOpen, trigger, disabled } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  console.log(trigger);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? trigger.label : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      <ContextualModal content={props.content} title={props.title} trigger={trigger} />
    </OverlayTrigger>
  );
}
