import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { GridStyle } from "src/components/Table";
import { LabelSuffixStyle } from "src/forms/FormContext";

export type PresentationContextProps = {
  // Value will be ignored if passed. The value is set based on existence of nested PresentationProviders
  baseContext?: boolean;
  numberAlignment?: "left" | "right";
  gridTableStyle?: GridStyle;
  formLabelSuffix?: LabelSuffixStyle;
  // Hide labels for input fields. Helpful when displaying in a Table and the column header acts as the label
  hideLabel?: boolean;
};

export const PresentationContext = createContext<PresentationContextProps>({});

export function PresentationProvider(props: PropsWithChildren<PresentationContextProps>) {
  const { children, ...presentationProps } = props;

  // Check to see if we are nested within another PresentationContext. If so, make sure values already above us are passed through if not overwritten (except baseContext)
  const existingContext = usePresentationContext();

  const context: PresentationContextProps = useMemo(
    () => ({ ...existingContext, ...presentationProps, baseContext: !existingContext.baseContext }),
    [presentationProps, existingContext],
  );

  return <PresentationContext.Provider value={context}>{children}</PresentationContext.Provider>;
}

export function usePresentationContext() {
  return useContext(PresentationContext);
}
