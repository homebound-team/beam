import { FieldState } from "@homebound/form-state";
import { FormSettings } from "src/forms/FormContext";

export function getLabelSuffix(settings: FormSettings, field: FieldState<any, any>): string {
  switch (settings.labelSuffix) {
    case "required":
      return field.required ? "(Required)" : "";
    case "optional":
      return field.required ? "" : "(Optional)";
    case "none":
      return "";
    case "both":
      return field.required ? "(Req)" : "(Opt)";
  }
  return "";
}
