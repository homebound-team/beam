import type { PressEvent } from "@react-types/shared";
import { ReactNode } from "react";
import { PresentationFieldProps } from "src/components/PresentationContext";
import { Xss } from "src/Css";
import { Callback } from "src/types";

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

export type TextFieldXss = Xss<"textAlign" | "justifyContent" | "fontWeight" | "fontSize" | "lineHeight">;

export interface BeamTextFieldProps<X> extends BeamFocusableProps, PresentationFieldProps {
  /** Whether the field is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  errorMsg?: string;
  helperText?: string | ReactNode;
  /** Input label */
  label: string;
  /** Marks the field as required or optional, the default is assumed ambiguous/unknown. */
  required?: boolean;
  value: string | undefined;
  /** Handler called when the interactive element state changes. */
  onChange: (value: string | undefined) => void;
  /** Called when the component loses focus, mostly for BoundTextField to use. */
  onBlur?: Callback;
  onFocus?: Callback;
  onEnter?: Callback;
  /** Whether the field is readOnly. If a ReactNode, it's treated as a "readOnly reason" that's shown in a tooltip. */
  readOnly?: boolean | ReactNode;
  placeholder?: string;
  /** Styles overrides */
  xss?: X;
}

export interface TextFieldInternalProps {
  /**
   * Denoting a field as 'compound' will remove existing borders on the returned field, including the 2px of height added by the borders.
   * It is expected that the caller reintroduces the border to achieve the expected field height and handles the custom border logic of a Compound Field
   * This is explicitly an internal property that is not exposed to any field's API.
   */
  compound?: boolean;
}
