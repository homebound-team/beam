import React, { ReactNode } from "react";
import { Value } from "../inputs";
import { BeamSelectFieldBaseProps, SelectFieldBase } from "../inputs/internal/SelectFieldBase";
import { HasIdAndName, Optional } from "../types";

export interface DropdownTreeSelectProps<O, V extends Value>
  extends Exclude<BeamSelectFieldBaseProps<O, V>, "unsetLabel"> {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. */
  getOptionMenuLabel?: (opt: O) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  values: V[];
  onSelect: (values: V[], opts: O[]) => void;
  options: O[];
}

export function DropdownTreeSelect<O, V extends Value>(props: DropdownTreeSelectProps<O, V>): JSX.Element;
export function DropdownTreeSelect<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<DropdownTreeSelectProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function DropdownTreeSelect<O, V extends Value>(
  props: Optional<DropdownTreeSelectProps<O, V>, "getOptionLabel" | "getOptionValue">,
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
    <>
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
    </>
  );
}
