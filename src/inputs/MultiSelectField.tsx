import React, { Key, ReactNode } from "react";
import { BeamSelectFieldBaseProps, SelectFieldBase } from "src/inputs/internal/SelectFieldBase";
import { HasIdAndName, Optional } from "src/types";

export interface MultiSelectFieldProps<O, V extends Key> extends BeamSelectFieldBaseProps<O> {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. */
  getOptionMenuLabel?: (opt: O) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  values: V[];
  onSelect?: (values: V[], opts: O[]) => void;
  options: O[];
}

/**
 * Provides a non-native select/dropdown widget.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 *
 * Note that the `O` and `V extends Key` constraints come from react-aria,
 * and so we cannot easily change them.
 */
export function MultiSelectField<O, V extends Key>(props: MultiSelectFieldProps<O, V>): JSX.Element;
export function MultiSelectField<O extends HasIdAndName<V>, V extends Key>(
  props: Optional<MultiSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function MultiSelectField<O, V extends Key>(
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
      values={values.map((v) => String(v))}
      onSelect={(keys) => {
        const [selectedValues, selectedOptions] = options
          .filter((o) => keys.includes(String(getOptionValue(o))))
          .reduce(
            (acc, o) => {
              acc[0].push(getOptionValue(o));
              acc[1].push(o);
              return acc;
            },
            [[] as V[], [] as O[]],
          );
        onSelect && onSelect(selectedValues, selectedOptions);
      }}
    />
  );
}
