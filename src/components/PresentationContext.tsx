import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import type { GridStyle } from "src/components/Table/TableStyles";
import type { Typography } from "src/Css";

export type InputStylePalette = "success" | "warning" | "caution" | "info";

/** Field presentation settings, set per field or for a subtree via {@link PresentationProvider}. */
export interface PresentationFieldProps {
  /** Aligns `NumberField` text; GridTable sets `"right"`. Defaults to `"left"`. */
  numberAlignment?: "left" | "right";
  /** Sets the label position or visibility. Defaults to "above"; "left" is deprecated. */
  labelStyle?: "inline" | "hidden" | "above" | /** @deprecated Use "above"; left labels are being retired. */ "left";
  /** @deprecated Defines the width property of the input field wrapper when using the deprecated `labelStyle="left"`. */
  labelLeftFieldWidth?: number | string;
  /** Text appended to the label of required and explicitly optional fields. Defaults to `"*"` on required fields. */
  labelSuffix?: LabelSuffixStyle;
  /** Removes the border and shows focus with a box-shadow; typically for compact fields in a table. */
  borderless?: boolean;
  /** Adds a border on hover, to highlight editable fields in a table. */
  borderOnHover?: boolean;
  /** Uses the shorter field height. */
  compact?: boolean;
  /** Overrides the font styles of fields and Chips. */
  typeScale?: Typography;
  /** `false` keeps a disabled field's normal look while it stays disabled. */
  visuallyDisabled?: false;
  /** Shows the error message in a tooltip instead of below the field. */
  errorInTooltip?: true;
  /** Allow the fields to grow to the width of its container. By default, fields will extend up to 550px */
  fullWidth?: boolean;
  /** Changes bg and hoverBg; useful when showing many fields w/in a table that require user attention; in no way should be used as a replacement for error/focus state */
  inputStylePalette?: InputStylePalette;
}

export type PresentationContextProps = {
  /** `inputStylePalette` omitted because it is too dependent on the individual field use case to be controlled at this level  */
  fieldProps?: Omit<PresentationFieldProps, "inputStylePalette">;
  gridTableStyle?: GridStyle;
  /** `false` keeps Chips and table cell content on one line. Defaults to wrapping. */
  wrap?: boolean;
};

export const PresentationContext = createContext<PresentationContextProps>({
  // Required fields should always show asterisk
  fieldProps: { labelSuffix: { required: "*" } },
});

/**
 * Sets default presentation props for every field and table below it.
 *
 * Nested providers merge `fieldProps` over the outer provider's values.
 */
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
