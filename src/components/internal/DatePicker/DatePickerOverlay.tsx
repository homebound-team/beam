import { HTMLAttributes, PropsWithChildren } from "react";
import { Css, Tokens } from "src/Css";

type DatePickerOverlayProps = {
  overlayProps: HTMLAttributes<HTMLElement>;
};

// Small wrapper around DatePicker to provide necessary styling and state handling when displayed as an overlay.
export function DatePickerOverlay({ overlayProps, children }: PropsWithChildren<DatePickerOverlayProps>) {
  return (
    <div css={Css.br4.bshModal.bgColor(Tokens.PopoverSurface).color(Tokens.OnSurface).oh.$} {...overlayProps}>
      {children}
    </div>
  );
}
