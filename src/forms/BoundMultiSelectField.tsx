import { FieldState } from "@homebound/form-state/dist/formState";
import { Observer } from "mobx-react";
import { MultiSelectField, MultiSelectFieldProps, Value } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";
import { defaultLabel } from "src/utils/defaultLabel";
import { useTestIds } from "src/utils/useTestIds";

export type BoundMultiSelectFieldProps<O, V extends Value> = Omit<
  MultiSelectFieldProps<O, V>,
  "values" | "onSelect" | "onBlur" | "onFocus"
> & {
  // Allow `onSelect` to be overridden to do more than just `field.set`.
  onSelect?: (values: V[], opts: O[]) => void;
  field: FieldState<any, V[] | null | undefined>;
};

/**
 * Wraps `MultiSelectField` and binds it to a form field.
 *
 * To ease integration with "select this fooId" inputs, we can take a list
 * of objects, `T` (i.e. `TradePartner[]`), but accept a field of type `V`
 * (i.e. `string`).
 *
 * The caller has to tell us how to turn `T` into `V`, which is usually a
 * lambda like `t => t.id`.
 */
export function BoundMultiSelectField<O, V extends Value>(props: BoundMultiSelectFieldProps<O, V>): JSX.Element;
export function BoundMultiSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<BoundMultiSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element;
export function BoundMultiSelectField<O, V extends Value>(
  props: Optional<BoundMultiSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const {
    field,
    options,
    readOnly,
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName
    onSelect = (value) => field.set(value),
    label = defaultLabel(field.key),
    ...others
  } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <MultiSelectField<O, V>
          label={label}
          values={(field.value as V[]) ?? []}
          onSelect={onSelect}
          options={options}
          readOnly={readOnly ?? field.readOnly}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          required={field.required}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          onBlur={() => field.blur()}
          onFocus={() => field.focus()}
          {...others}
          {...testId}
        />
      )}
    </Observer>
  );
}
