import React, { HTMLAttributes, PropsWithChildren } from "react";
import { Css } from "src/Css";

interface DatePickerOverlayProps {
  overlayProps: HTMLAttributes<HTMLElement>;
}

// Small wrapper around DatePicker to provide necessary styling and state handling when displayed as an overlay.
export function DatePickerOverlay({ overlayProps, children }: PropsWithChildren<DatePickerOverlayProps>) {
  return (
    // Adds `tabIndex` so clicking within the DatePicker will provide a `e.relatedTarget` on blur and focus events.
    // This allows for components such as the DateField to conditionally trigger their 'onBlur' prop. E.g. If the user leaves the field to interact with the DatePicker, then don't call onBlur
    <div css={Css.br4.bshModal.$} {...overlayProps} tabIndex={0}>
      {children}
    </div>
  );
}
