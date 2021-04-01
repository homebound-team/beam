import type { PressEvent } from "@react-types/shared";

/** Base Interfaced */
export interface BeamFocusableProps {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
}

export interface BeamDisabledProps {
  /** Whether the interactive element is disabled. */
  disabled?: boolean;
}

export interface BeamButtonProps extends BeamDisabledProps {
  /** Handler that is called when the press is released over the target. */
  onClick?: (e: PressEvent) => void;
}

export interface BeamOnChangeProps<T> {
  /** Handler called when the interactive element state changes. */
  onChange?: (value: T) => void;
}

export interface BeamTextFieldProps extends BeamOnChangeProps<string> {
  label?: string;
  value?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  errorMsg?: string;
}
