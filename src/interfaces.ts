import type { PressEvent } from "@react-types/shared";

/** Base Interfaced */
export interface BeamFocusableProps {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
}

export interface BeamButtonProps {
  /** Whether the interactive element is disabled. */
  disabled?: boolean;
}

export interface BeamButtonProps extends BeamDisabledProps {
  /** Handler that is called when the press is released over the target. */
  // TODO: @KoltonG it would be nice to merge onChange and onClick into the same handler name...
  onClick?: (e: PressEvent) => void;
}

export interface BeamTextFieldProps extends BeamFocusableProps {
  /** Whether the interactive element is disabled. */
  disabled?: boolean;
  errorMsg?: string;
  /** Input label */
  label?: string;
  value: string | undefined;
  /** Handler called when the interactive element state changes. */
  onChange: (value: string | undefined) => void;
  /** Called when the component loses focus, mostly for BoundTextField to use. */
  onBlur?: () => void;
  readOnly?: boolean;
}
