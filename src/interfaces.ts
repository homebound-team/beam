import type { PressEvent } from "@react-types/shared";
import { ReactNode } from "react";

/** Base Interfaced */
export interface BeamFocusableProps {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
}

export interface BeamButtonProps {
  /** Whether the interactive element is disabled. */
  disabled?: boolean;
  /** If set, will show a tooltip about why the button is disabled. */
  disabledReason?: string;
  /** Handler that is called when the press is released over the target. */
  onClick?: (e: PressEvent) => void;
}

export interface BeamTextFieldProps extends BeamFocusableProps {
  /** Whether the interactive element is disabled. */
  disabled?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  /** Input label */
  label: string;
  /** Marks the field as required or optional, the default is assumed ambiguous/unknown. */
  required?: boolean;
  /** If set, label will be placed as `aria-label` on input element */
  hideLabel?: boolean;
  value: string | undefined;
  /** Handler called when the interactive element state changes. */
  onChange: (value: string | undefined) => void;
  /** Called when the component loses focus, mostly for BoundTextField to use. */
  onBlur?: () => void;
  onFocus?: () => void;
  readOnly?: boolean;
}
