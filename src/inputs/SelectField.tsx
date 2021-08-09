import React, { ReactNode } from "react";
import { Value } from "src/inputs";
import { BeamSelectFieldBaseProps, SelectFieldBase } from "src/inputs/internal/SelectFieldBase";
import { HasIdAndName } from "src/types";

export type SelectFieldProps<O, V extends Value, V2 extends Value> = BeamSelectFieldBaseProps<O> & {
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  value: V | undefined;
  onSelect: (value: V2, opt: O) => void;
  options: O[];
} & (O extends HasIdAndName<V>
    ? { mapOption?: { label?: (opt: O) => string; value?: (opt: O) => V2; menuLabel?: (opt: O) => ReactNode } }
    : { mapOption: { label: (opt: O) => string; value: (opt: O) => V2; menuLabel?: (opt: O) => ReactNode } });

/**
 * Provides a non-native select/dropdown widget.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 */
export function SelectField<O, V extends Value, V2 extends Value>(props: SelectFieldProps<O, V, V2>): JSX.Element {
  const { options, onSelect, value, mapOption: maybeMapOption, ...otherProps } = props;

  const mapOption = {
    value: (o: any) => o.id,
    label: (o: any) => o.name,
    menuLabel: (o: any) => o.name,
    ...maybeMapOption,
  };

  return (
    <SelectFieldBase
      {...otherProps}
      options={options}
      getOptionLabel={(o) => mapOption.label(o)}
      getOptionMenuLabel={(o) => {
        const mapped = mapOption.label!(o);
        return mapped.menuLabel ?? mapped.label;
      }}
      getOptionValue={(o) => mapOption.value(o)}
      values={value ? [value] : []}
      onSelect={(values) => {
        if (values.length > 0) {
          const selectedOption = options.find((o) => mapOption.value(o) === values[0]);
          onSelect && selectedOption && onSelect(mapOption.value(selectedOption), selectedOption);
        }
      }}
    />
  );
}

export const identity = {
  value<O, V extends Value>(o: { value: V }): V {
    return o.value;
  },
  label<O>(o: { label: string }): string {
    return o.label;
  },
};

export function idAndName<V extends Value>() {
  return {
    value: (o: { id: V; name: string }): V => o.id,
    label: (o: { id: V; name: string }): String => o.name,
  };
}

export const idAndName2 = {
  value<V extends Value>(o: { id: V; name: string }): V {
    return o.id;
  },
  label<V extends Value>(o: { id: V; name: string }): string {
    return o.name;
  },
};
