import { useMemo, type JSX, type ReactNode } from "react";
import { Css } from "src/Css";
import { SelectedOptionPillList } from "src/forms/SelectedOptionPillList";
import { ComboBoxBase, initializeOptions, type ComboBoxBaseProps } from "src/inputs/internal/ComboBoxBase";
import type { Value } from "src/inputs/Value";
import type { HasIdAndName, Optional } from "src/types";

export type MultiSelectFieldProps<O, V extends Value> = {
  /** Renders `opt` in the dropdown menu and pill list, defaults to the `getOptionLabel` prop. */
  getOptionMenuLabel?: (opt: O) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  values: V[];
  onSelect: (values: V[], opts: O[]) => void;
  /** Selected options render as a pill list below the field; in-field and listbox chips are hidden. */
  withPillList?: boolean;
} & Exclude<ComboBoxBaseProps<O, V>, "unsetLabel" | "addNew">;

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
    getOptionMenuLabel,
    withPillList = false,
    hideChips = false,
    values,
    onSelect,
    options,
    autoSort = true,
    ...otherProps
  } = props;

  const pillOptions = useMemo(() => {
    if (!withPillList) return [];
    const resolved = initializeOptions(options, getOptionValue, getOptionLabel, undefined, autoSort);
    return resolved
      .filter((o) => values.includes(getOptionValue(o)))
      .map((o) => {
        const value = getOptionValue(o);
        return {
          id: String(value),
          value: getOptionMenuLabel?.(o) ?? getOptionLabel(o),
          onRemove: () => {
            const nextValues = values.filter((v) => v !== value);
            const nextOpts = resolved.filter((opt) => nextValues.includes(getOptionValue(opt)));
            onSelect(nextValues, nextOpts);
          },
        };
      });
    // getOptionLabel / getOptionValue / getOptionMenuLabel / onSelect are typically lambdas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withPillList, options, values, autoSort]);

  const field = (
    <ComboBoxBase
      multiselect
      hideChips={withPillList || hideChips}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      getOptionMenuLabel={getOptionMenuLabel}
      values={values}
      onSelect={onSelect}
      options={options}
      autoSort={autoSort}
      {...otherProps}
    />
  );

  if (!withPillList) return field;

  return (
    <div css={Css.df.fdc.gap2.w100.$}>
      {field}
      <SelectedOptionPillList options={pillOptions} />
    </div>
  );
}
