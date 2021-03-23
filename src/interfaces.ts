import type { PressEvent } from "@react-types/shared";

export interface BeamFocusableProps {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
}

export interface BeamButtonProps {
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Handler that is called when the press is released over the target. */
  onClick?: (e: PressEvent) => void;
}

export interface BeamTextFieldProps {
  label?: string;
  onChange?: (value: string) => void;
  value?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  errorMsg?: string;
}
