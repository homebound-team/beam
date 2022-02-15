import React, { HTMLAttributes } from "react";
import { OverlayTriggerState } from "react-stately";
import { DatePicker, DatePickerProps } from "src/components/DatePicker";
import { Css } from "src/Css";

interface DatePickerOverlayProps extends DatePickerProps {
  overlayProps: HTMLAttributes<HTMLElement>;
  state: OverlayTriggerState;
}

// Small wrapper around DatePicker to provide necessary styling and state handling when displayed as an overlay.
export function DatePickerOverlay({ overlayProps, state, ...datePickerProps }: DatePickerOverlayProps) {
  return (
    <div css={Css.br4.bshModal.$} {...overlayProps}>
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
