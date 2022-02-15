import React from "react";
import { DatePicker, DatePickerProps } from "src/components/DatePicker";
import { Css } from "src/Css";

// Small wrapper around DatePicker to provide necessary styling when displayed as an overlay.
export function DatePickerOverlay(props: DatePickerProps) {
  return (
    <div css={Css.br4.bshModal.$}>
      <DatePicker {...props} />
    </div>
  );
}
