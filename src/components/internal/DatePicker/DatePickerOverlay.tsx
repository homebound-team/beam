import React, { HTMLAttributes } from "react";
import { OverlayTriggerState } from "react-stately";
import { DatePicker, DatePickerProps } from "src/components/internal/DatePicker/DatePicker";
import { DateRangePicker, DateRangePickerProps } from "src/components/internal/DatePicker/DateRangePicker";
import { Css } from "src/Css";
import { DateFieldMode } from "src/inputs";

interface BaseDatePickerOverlayProps {
  overlayProps: HTMLAttributes<HTMLElement>;
  state: OverlayTriggerState;
  mode?: DateFieldMode;
}

// interface DatePickerOverlayProps extends Omit<DatePickerProps, "value">, BaseDatePickerOverlayProps {
interface DatePickerOverlayProps extends DatePickerProps, BaseDatePickerOverlayProps {
  mode: "single";
}
// interface DateRangePickerOverlayProps extends Omit<DateRangePickerProps, "range">, BaseDatePickerOverlayProps {
interface DateRangePickerOverlayProps extends DateRangePickerProps, BaseDatePickerOverlayProps {
  mode: "range";
}

// Small wrapper around DatePicker to provide necessary styling and state handling when displayed as an overlay.
export function DatePickerOverlay(props: DatePickerOverlayProps | DateRangePickerOverlayProps) {
  const { overlayProps, state, mode, ...datePickerProps } = props;

  return (
    // Adds `tabIndex` so clicking within the DatePicker will provide a `e.relatedTarget` on blur and focus events.
    // This allows for components such as the DateField to conditionally trigger their 'onBlur' prop. E.g. If the user leaves the field to interact with the DatePicker, then don't call onBlur
    <div css={Css.br4.bshModal.$} {...overlayProps} tabIndex={0}>
      {isDateRangePicker(props) ? (
        <DateRangePicker {...datePickerProps} range={props.range} onSelect={(dr) => props.onSelect(dr)} />
      ) : (
        <DatePicker
          {...datePickerProps}
          value={props.value}
          onSelect={(d) => {
            props.onSelect(d);
            state.close();
          }}
        />
      )}
    </div>
  );
}

function isDateRangePicker(props: DatePickerProps | DateRangePickerProps): props is DateRangePickerProps {
  return typeof props === "object" && "range" in props;
}
