import { HTMLAttributes, PropsWithChildren } from "react";
import { Css } from "src/Css";

interface DatePickerOverlayProps {
  overlayProps: HTMLAttributes<HTMLElement>;
}

// Small wrapper around DatePicker to provide necessary styling and state handling when displayed as an overlay.
export function DatePickerOverlay({ overlayProps, children }: PropsWithChildren<DatePickerOverlayProps>) {
  return (
    <div css={Css.br4.bshModal.$} {...overlayProps}>
      {children}
    </div>
  );
}
