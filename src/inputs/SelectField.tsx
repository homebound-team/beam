import { useMemo } from "react";
import { Value } from "src/inputs";
import { ComboBoxBase, ComboBoxBaseProps, unsetOption } from "src/inputs/internal/ComboBoxBase";
import { HasIdIsh, HasNameIsh, Optional } from "src/types";
import { defaultOptionLabel, defaultOptionValue } from "src/utils/options";

export interface SelectFieldProps<O, V extends Value>
  extends Omit<ComboBoxBaseProps<O, V>, "values" | "onSelect" | "multiselect"> {
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  value: V | undefined;
  /**
   * Called when a value is selected, or `undefined` if `unsetLabel` is being used.
   *
   * Ideally callers that didn't pass `unsetLabel` would not have to handle the ` | undefined` here.
   */
  onSelect: (value: V | undefined, opt: O | undefined) => void;
}

/**
 * Provides a non-native select/dropdown widget.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 */
export function SelectField<O extends HasIdIsh<V> & HasNameIsh, V extends Value>(
  props: Optional<SelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function SelectField<O extends HasIdIsh<V>, V extends Value>(
  props: Optional<SelectFieldProps<O, V>, "getOptionValue">,
): JSX.Element;
export function SelectField<O extends HasNameIsh, V extends Value>(
  props: Optional<SelectFieldProps<O, V>, "getOptionLabel">,
): JSX.Element;
export function SelectField<O, V extends Value>(props: SelectFieldProps<O, V>): JSX.Element;
export function SelectField<O, V extends Value>(
  props: Optional<SelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const {
    getOptionValue = defaultOptionValue,
    getOptionLabel = defaultOptionLabel,
    options,
    onSelect,
    value,
    autoSort,
    ...otherProps
  } = props;
  const values = useMemo(() => [value], [value]);
  return (
    <ComboBoxBase
      {...otherProps}
      options={options}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      values={values}
      autoSort={autoSort}
      onSelect={(values, options) => {
        // If the user used `unsetLabel`, then values will be `[undefined]` and options `[unsetOption]`
        if (values.length > 0 && options.length > 0) {
          const option = options[0];
          onSelect(values[0], option === unsetOption ? undefined : option);
        }
      }}
    />
  );
}
