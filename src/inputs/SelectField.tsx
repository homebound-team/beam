import React, { ReactNode } from "react";
import { Value } from "src/inputs";
import { BeamSelectFieldBaseProps, SelectFieldBase } from "src/inputs/internal/SelectFieldBase";

export interface SelectFieldProps<O, V extends Value> extends BeamSelectFieldBaseProps<O> {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. */
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  value: V | undefined;
  onSelect: (value: V, opt: O) => void;
  options: O[];
  mapOption: (opt: O) => { label: string; value: V; menuLabel?: ReactNode };
}

/**
 * Provides a non-native select/dropdown widget.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 */
export function SelectField<O, V extends Value>(props: SelectFieldProps<O, V>): JSX.Element {
  const { options, onSelect, value, mapOption, ...otherProps } = props;

  return (
    <SelectFieldBase
      {...otherProps}
      options={options}
      getOptionLabel={(o) => mapOption(o).label}
      getOptionMenuLabel={(o) => {
        const mapped = mapOption(o);
        return mapped.menuLabel ?? mapped.label;
      }}
      getOptionValue={(o) => mapOption(o).value}
      values={value ? [value] : []}
      onSelect={(values) => {
        if (values.length > 0) {
          const selectedOption = options.find((o) => mapOption(o).value === values[0]);
          onSelect && selectedOption && onSelect(mapOption(selectedOption).value, selectedOption);
        }
      }}
    />
  );
}

export function identity<T>(o: T): T {
  return o;
}

export function idAndName<V extends Value>({ id, name }: { id: V; name: string }) {
  return { value: id, label: name };
}
