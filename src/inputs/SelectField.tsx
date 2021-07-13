import React, { ReactNode } from "react";
import { Value } from "src/inputs";
import { BeamSelectFieldBaseProps, SelectFieldBase } from "src/inputs/internal/SelectFieldBase";
import { HasIdAndName, Optional } from "src/types";

export interface SelectFieldProps<O, V extends Value> extends BeamSelectFieldBaseProps<O> {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. */
  getOptionMenuLabel?: (opt: O) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  value: V | undefined;
  onSelect: (value: V, opt: O) => void;
  options: O[];
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
    <SelectFieldBase
      {...otherProps}
      options={options}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      values={value ? [value] : []}
      onSelect={(values) => {
        if (values.length > 0) {
          const selectedOption = options.find((o) => getOptionValue(o) === values[0]);
          onSelect && selectedOption && onSelect(getOptionValue(selectedOption), selectedOption);
        }
      }}
    />
  );
}
