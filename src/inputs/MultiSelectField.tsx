import React, { ReactNode } from "react";
import { Value } from "src/inputs";
import { BeamSelectFieldBaseProps, SelectFieldBase } from "src/inputs/internal/SelectFieldBase";
import { HasIdAndName, Optional } from "src/types";

export interface MultiSelectFieldProps<O, V extends Value> extends BeamSelectFieldBaseProps<O, V> {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. */
  getOptionMenuLabel?: (opt: O) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  values: V[];
  onSelect: (values: V[], opts: O[]) => void;
  options: O[];
}

/**
 * Provides a non-native multiselect/dropdown widget.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 */
export function MultiSelectField<O, V extends Value>(props: MultiSelectFieldProps<O, V>): JSX.Element;
export function MultiSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<MultiSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function MultiSelectField<O, V extends Value>(
  props: Optional<MultiSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const {
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName
    options,
    onSelect,
    values,
    ...otherProps
  } = props;

  return (
    <SelectFieldBase
      multiselect
      {...otherProps}
      options={options}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      values={values}
      onSelect={(values) => {
        const [selectedValues, selectedOptions] = options
          .filter((o) => values.includes(getOptionValue(o)))
          .reduce(
            (acc, o) => {
              acc[0].push(getOptionValue(o));
              acc[1].push(o);
              return acc;
            },
            [[] as V[], [] as O[]],
          );
        onSelect(selectedValues, selectedOptions);
      }}
    />
  );
}
