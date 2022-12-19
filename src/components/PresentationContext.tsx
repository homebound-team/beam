import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { GridStyle } from "src/components/Table";
import { Typography } from "src/Css";

export interface PresentationFieldProps {
  numberAlignment?: "left" | "right";
  /** Sets the label position or visibility. Defaults to "above" */
  labelStyle?: "inline" | "hidden" | "above" | "left";
  labelSuffix?: LabelSuffixStyle;
  // Typically used for compact fields in a table. Removes border and uses an box-shadow for focus behavior
  borderless?: boolean;
  // Defines height of the field
  compact?: boolean;
  // Changes default font styles for input fields and Chips
  typeScale?: Typography;
  // If set to `false` then fields will not appear disabled, but will still be disabled.
  visuallyDisabled?: false;
  // If set error messages will be rendered as tooltips rather than below the field
  errorInTooltip?: true;
}

export type PresentationContextProps = {
  fieldProps?: PresentationFieldProps;
  gridTableStyle?: GridStyle;
  // Defines whether content should be allowed to wrap or not. `undefined` is treated as true.
  wrap?: boolean;
};

export const PresentationContext = createContext<PresentationContextProps>({
  fieldProps: { labelSuffix: { required: "*" } },
});

export function PresentationProvider(props: PropsWithChildren<PresentationContextProps>) {
  const { children, ...presentationProps } = props;

  // Check to see if we are nested within another PresentationContext. If so, make sure values already above us are passed through if not overwritten (except baseContext)
  const existingContext = usePresentationContext();

  const context: PresentationContextProps = useMemo(() => {
    const fieldProps = { ...existingContext.fieldProps, ...presentationProps.fieldProps };
    return { ...existingContext, ...presentationProps, fieldProps };
  }, [presentationProps, existingContext]);

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
