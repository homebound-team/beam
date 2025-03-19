import { usePresentationContext } from "src/components/PresentationContext";

// We promise to always call `getLabelSuffix` deterministically
export function useLabelSuffix(required: boolean | undefined, readOnly: boolean | undefined): string | undefined {
  const { fieldProps } = usePresentationContext();
  if (readOnly) return undefined;
  if (required === true) {
    return fieldProps?.labelSuffix?.required;
  } else if (required === false) {
    return fieldProps?.labelSuffix?.optional;
  } else {
    return undefined;
  }
}
