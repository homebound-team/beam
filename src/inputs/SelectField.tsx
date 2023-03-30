import { Value } from "src/inputs";
import { ComboBoxBase, ComboBoxBaseProps, unsetOption } from "src/inputs/internal/ComboBoxBase";
import { HasIdAndName, Optional } from "src/types";

export interface SelectFieldProps<O, V extends Value>
  extends Omit<ComboBoxBaseProps<O, V>, "values" | "onSelect" | "multiselect"> {
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  value: V | undefined;
  onSelect: (value: V | undefined, opt: O | undefined) => void;
}

/**
 * Provides a non-native select/dropdown widget.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 */
export function SelectField<O, V extends Value>(props: SelectFieldProps<O, V>): JSX.Element;
export function SelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<SelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function SelectField<O, V extends Value>(
  props: Optional<SelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const {
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName
    options,
    onSelect,
    value,
    ...otherProps
  } = props;

  return (
    <ComboBoxBase
      {...otherProps}
      options={options}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      values={[value]}
      onSelect={(values, options) => {
        if (values.length > 0 && options.length > 0) {
          const option = options[0];
          onSelect(values[0], option === unsetOption ? undefined : option);
        }
      }}
    />
  );
}
