import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { GridStyle } from "src/components/Table";
import { Typography } from "src/Css";

export type InputStylePalette = "success" | "warning" | "caution" | "info";

export interface PresentationFieldProps {
  numberAlignment?: "left" | "right";
  /** Sets the label position or visibility. Defaults to "above" */
  labelStyle?: "inline" | "hidden" | "above" | "left";
  /** Defines the width property of the input field wrapper when using `labelStyle="left"`. */
  labelLeftFieldWidth?: number | string;
  labelSuffix?: LabelSuffixStyle;
  // Typically used for compact fields in a table. Removes border and uses an box-shadow for focus behavior
  borderless?: boolean;
  // Typically used for highlighting editable fields in a table. Adds a border on hover.
  borderOnHover?: boolean;
  // Defines height of the field
  compact?: boolean;
  // Changes default font styles for input fields and Chips
  typeScale?: Typography;
  // If set to `false` then fields will not appear disabled, but will still be disabled.
  visuallyDisabled?: false;
  // If set error messages will be rendered as tooltips rather than below the field
  errorInTooltip?: true;
  /** Allow the fields to grow to the width of its container. By default, fields will extend up to 550px */
  fullWidth?: boolean;
  /** Changes bg and hoverBg; Takes priority over `contrast`; Useful when showing many fields w/in a table that require user attention; In no way should be used as a replacement for error/focus state */
  inputStylePalette?: InputStylePalette;
}

export type PresentationContextProps = {
  fieldProps?: Omit<PresentationFieldProps, "inputStylePalette">;
  gridTableStyle?: GridStyle;
  // Defines whether content should be allowed to wrap or not. `undefined` is treated as true.
  wrap?: boolean;
};

export const PresentationContext = createContext<PresentationContextProps>({});

export function PresentationProvider(props: PropsWithChildren<PresentationContextProps>) {
  const { children, ...presentationProps } = props;

  // Check to see if we are nested within another PresentationContext. If so, make sure values already above us are passed through if not overwritten (except baseContext)
  const existingContext = usePresentationContext();

  const context: PresentationContextProps = useMemo(
    () => {
      const fieldProps = { ...existingContext.fieldProps, ...presentationProps.fieldProps };
      return { ...existingContext, ...presentationProps, fieldProps };
    },
    // Isn't this `presentationProps` always a new instance due to the `...` above?
    [presentationProps, existingContext],
  );

  return <PresentationContext.Provider value={context}>{children}</PresentationContext.Provider>;
}

export function usePresentationContext() {
  return useContext(PresentationContext);
}

/**
 * Label settings for required/optional fields.
 *
 * We may want to just hard-code this behavior, so that it's very consistent,
 * but for now making it configurable.
 */
export type LabelSuffixStyle = {
  /** The suffix to use for required fields. */
  required?: string;
  /** The suffix to use for explicitly optional (i.e. `required=false`) fields. */
  optional?: string;
};
