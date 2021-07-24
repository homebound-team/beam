import { createContext } from "react";

export interface FormSettings {
  labelSuffix: LabelSuffixStyle;
}

export type LabelSuffixStyle = "required" | "optional" | "both" | "none";

/** An internal context for holding form-wide state/preferences. */
export const FormContext = createContext<FormSettings>({
  labelSuffix: "none",
});
