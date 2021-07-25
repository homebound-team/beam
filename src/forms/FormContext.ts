import { createContext } from "react";

export interface FormSettings {
  labelSuffix: LabelSuffixStyle;
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

/**
 * An internal context for holding form-wide state/preferences.
 *
 * Currently this can only be set via the `FormLines.labelSuffix` prop,
 * otherwise we just use a hard-coded default.
 *
 * Eventually we should probably expose a way to set this via the `BeamContext`
 * as well, and also override on individual fields as needed.
 */
export const FormContext = createContext<FormSettings>({
  labelSuffix: { required: "*", optional: "(Optional)" },
});
