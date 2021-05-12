import type { CheckboxGroupState, ToggleState } from "react-stately";

/** Adapts our state to what useToggleState returns in a stateless manner. */
export function toToggleState(isSelected: boolean, onChange: (value: boolean) => void): ToggleState {
  return {
    isSelected,
    setSelected: onChange,
    toggle: () => onChange(!isSelected),
  };
}

/** Adapts our state to what use*Group returns in a stateless manner. */
export function toGroupState<T extends string>(values: T[], onChange: (value: T[]) => void): CheckboxGroupState {
  const addValue = (value: T) => onChange([...values, value]);
  const removeValue = (value: T) => onChange(values.filter((_value) => _value !== value));

  return {
    value: values,
    setValue: onChange,
    isSelected: (value: T) => values.includes(value),
    addValue,
    removeValue,
    toggleValue: (value: T) => (values.includes(value) ? addValue(value) : removeValue(value)),
    isDisabled: false,
    isReadOnly: false,
  };
}

export * from "./SuperDrawer";
export * from "./useTestIds";
