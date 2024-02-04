import { useMemo } from "react";
import { Value } from "src/inputs";
import {
  ComboBoxBase,
  ComboBoxBaseProps,
  GetOptionLabel,
  GetOptionValue,
  MaybeGetOptionLabel,
  MaybeGetOptionValue,
  unsetOption,
} from "src/inputs/internal/ComboBoxBase";
import { isDefined } from "src/utils";

export type SelectFieldProps<O, V extends Value> = ComboBoxBaseProps<O, V> & {
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  value: V | undefined;
  /**
   * Called when a value is selected, or `undefined` if `unsetLabel` is being used.
   *
   * Ideally callers that didn't pass `unsetLabel` would not have to handle the ` | undefined` here.
   */
  onSelect: (value: V | undefined, opt: O | undefined) => void;
} & ((MaybeGetOptionLabel<O> & MaybeGetOptionValue<O, V>) | (GetOptionLabel<O> & GetOptionValue<O, V>));

/**
 * Provides a non-native select/dropdown widget.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 */
export function SelectField<O, V extends Value>(props: SelectFieldProps<O, V>): JSX.Element {
  const { options, onSelect, value, ...otherProps } = props;
  const values = useMemo(() => (isDefined(value) ? [value] : value), [value]);
  return (
    <ComboBoxBase<O, V>
      options={options}
      values={values}
      onSelect={(values, options) => {
        // If the user used `unsetLabel`, then values will be `[undefined]` and options `[unsetOption]`
        if (values.length > 0 && options.length > 0) {
          const option = options[0];
          onSelect(values[0], option === unsetOption ? undefined : option);
        }
      }}
      {...otherProps}
    />
  );
}
