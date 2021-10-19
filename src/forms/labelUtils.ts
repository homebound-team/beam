import { usePresentationContext } from "src/components/PresentationContext";

export function getLabelSuffix(required: boolean | undefined): string | undefined {
  // We promise to always call `getLabelSuffix` deterministically
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { fieldProps } = usePresentationContext();
  if (required === true) {
    return fieldProps?.labelSuffix?.required;
  } else if (required === false) {
    return fieldProps?.labelSuffix?.optional;
  } else {
    return undefined;
  }
}
