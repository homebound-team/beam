import { useRef } from "react";
import { useMenuTrigger } from "react-aria";
import { useMenuTriggerState } from "react-stately";
import { DatePicker, DatePickerProps } from "src/components/internal/DatePicker/DatePicker";
import { DatePickerOverlay } from "src/components/internal/DatePicker/DatePickerOverlay";
import {
  isIconButton,
  isTextButton,
  OverlayTrigger,
  OverlayTriggerProps,
} from "src/components/internal/OverlayTrigger";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

interface ButtonDatePickerProps
  extends DatePickerProps,
    Pick<OverlayTriggerProps, "trigger" | "placement" | "disabled" | "tooltip"> {
  defaultOpen?: boolean;
}

export function ButtonDatePicker(props: ButtonDatePickerProps) {
  const { defaultOpen, disabled, trigger, onSelect, ...datePickerProps } = props;
  const state = useMenuTriggerState({ isOpen: defaultOpen });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({ isDisabled: !!disabled }, state, buttonRef);
  const tid = useTestIds(
    props,
    isTextButton(trigger) ? defaultTestId(trigger.label) : isIconButton(trigger) ? trigger.icon : trigger.name,
  );

  return (
    <OverlayTrigger {...props} menuTriggerProps={menuTriggerProps} state={state} buttonRef={buttonRef} {...tid}>
      <DatePickerOverlay overlayProps={menuProps}>
        <DatePicker
          {...datePickerProps}
          onSelect={(d) => {
            onSelect(d);
            state.close();
          }}
          {...tid.datePicker}
        />
      </DatePickerOverlay>
    </OverlayTrigger>
  );
}
