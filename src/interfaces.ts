import type { PressEvent } from "@react-types/shared";
import { ReactNode } from "react";

/** Base Interfaced */
export interface BeamFocusableProps {
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
}

export interface BeamButtonProps {
  /**
   * Whether the interactive element is disabled.
   *
   * If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip.
   */
  disabled?: boolean | ReactNode;
  /** If function, then it is the handler that is called when the press is released over the target. Otherwise if string, it is the URL path for the link */
  onClick?: ((e: PressEvent) => void) | string;
  /** Text to be shown via a tooltip when the user hovers over the button */
  tooltip?: ReactNode;
  /** Whether to open link in a new tab. This only effects the element if the `onClick` is a `string`/URL. */
  openInNew?: boolean;
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
  placeholder?: string;
}
