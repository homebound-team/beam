import React, { HTMLAttributes } from "react";
import { OverlayTriggerState } from "react-stately";
import { DatePicker, DatePickerProps } from "src/components/internal/DatePicker/DatePicker";
import { Css } from "src/Css";

interface DatePickerOverlayProps extends DatePickerProps {
  overlayProps: HTMLAttributes<HTMLElement>;
  state: OverlayTriggerState;
}

// Small wrapper around DatePicker to provide necessary styling and state handling when displayed as an overlay.
export function DatePickerOverlay({ overlayProps, state, ...datePickerProps }: DatePickerOverlayProps) {
  return (
    // Adds `tabIndex` so clicking within the DatePicker will provide a `e.relatedTarget` on blur and focus events.
    // This allows for components such as the DateField to conditionally trigger their 'onBlur' prop. E.g. If the user leaves the field to interact with the DatePicker, then don't call onBlur
    <div css={Css.br4.bshModal.$} {...overlayProps} tabIndex={0}>
      <DatePicker
        {...datePickerProps}
        onSelect={(d) => {
          datePickerProps.onSelect(d);
          state.close();
        }}
      />
    </div>
  );
}
