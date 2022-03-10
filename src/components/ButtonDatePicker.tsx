import { useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { DatePickerProps } from "src/components/internal/DatePicker";
import { DatePickerOverlay } from "src/components/internal/DatePickerOverlay";
import { isTextButton, OverlayTrigger, OverlayTriggerProps } from "src/components/internal/OverlayTrigger";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface ButtonDatePickerProps
  extends DatePickerProps,
    Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  defaultOpen?: boolean;
}

export function ButtonDatePicker(props: ButtonDatePickerProps) {
  const { defaultOpen, disabled, trigger } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(props, isTextButton(trigger) ? defaultTestId(trigger.label) : trigger.icon);

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      <DatePickerOverlay {...props} state={state} overlayProps={menuProps} {...tid.datePicker} />
    </OverlayTrigger>
  );
}
