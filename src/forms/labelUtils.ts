import { useContext } from "react";
import { FormContext } from "src/forms/FormContext";

export function getLabelSuffix(required: boolean | undefined): string | undefined {
  // We promise to always call `getLabelSuffix` deterministically
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const settings = useContext(FormContext);
  if (required === true) {
    return settings.labelSuffix.required;
  } else if (required === false) {
    return settings.labelSuffix.optional;
  } else {
    return undefined;
  }
}
