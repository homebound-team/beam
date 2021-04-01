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
  // TODO: @KoltonG it would be nice to merge onChange and onClick into the same handler name...
  onClick?: (e: PressEvent) => void;
}

export interface BeamOnChangeProps<T> {
  /** Handler called when the interactive element state changes. */
  onChange?: (value: T) => void;
}

// TODO: Maybe label, value, onChange/onClick should be together since they are
// all related to inputs... I guess same for disabled...
export interface BeamLabelProps {
  /** Input label */
  label?: string;
}

export interface BeamTextFieldProps
  extends BeamOnChangeProps<string>,
    BeamLabelProps,
    BeamDisabledProps,
    BeamFocusableProps {
  value?: string;
  readOnly?: boolean;
  errorMsg?: string;
}
