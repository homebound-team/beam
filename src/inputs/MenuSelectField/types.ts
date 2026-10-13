import type { ReactNode } from "react";
import type { PresentationFieldProps } from "src/components/PresentationContext";
import type { OptionsOrLoad } from "src/inputs/internal/ComboBoxBase";
import type { Value } from "src/inputs/Value";

/** Common menu select presentation and option props. */
export type MenuSelectFieldBaseProps<O, V extends Value> = {
  label: string;
  /** The full list, or the selected option plus a loader fired the first time the menu opens. */
  options: OptionsOrLoad<O>;
  /** Defaults to `option.id`. */
  getOptionValue?: (opt: O) => V;
  /** String used in the trigger and the option's accessible name. Defaults to `option.name`. */
  getOptionLabel?: (opt: O) => string;
  /** Custom content for the menu row. Falls back to `getOptionLabel`. */
  getOptionMenuLabel?: (opt: O) => ReactNode;
  /** Extra text the menu search matches, in addition to `getOptionLabel`. */
  getOptionSearchText?: (opt: O) => string | readonly string[];
  disabledOptions?: (V | { value: V; reason: string })[];
  /** Shown in the field when nothing is selected, e.g. "All". */
  nothingSelectedText?: string;
  placeholder?: string;
  /** Placeholder for the search input inside the menu. */
  searchPlaceholder?: string;
  /** Whether the field is disabled. If a ReactNode, it's shown as the disabled reason in a tooltip. */
  disabled?: boolean | ReactNode;
  /** Whether the field is read-only. If a ReactNode, it's shown as the read-only reason in a tooltip. */
  readOnly?: boolean | ReactNode;
  required?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onFocus?: VoidFunction;
  onBlur?: VoidFunction;
} & Pick<
  PresentationFieldProps,
  | "labelStyle"
  | "compact"
  | "borderless"
  | "borderOnHover"
  | "fullWidth"
  | "visuallyDisabled"
  | "errorInTooltip"
  | "inputStylePalette"
>;
