import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { SelectField, SelectFieldProps, Value } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";
import { maybeCall } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { useTestIds } from "src/utils/useTestIds";
import {defaultTestId} from "../utils/defaultTestId";

export type BoundSelectFieldProps<O, V extends Value> = Omit<SelectFieldProps<O, V>, "value" | "onSelect" | "label"> & {
  // Allow `onSelect` to be overridden to do more than just `field.set`.
  onSelect?: (value: V | undefined, opt: O | undefined) => void;
  field: FieldState<any, V | null | undefined>;
  label?: string;
};

/**
 * Wraps `SelectField` and binds it to a form field.
 *
 * To ease integration with "select this fooId" inputs, we can take a list
 * of objects, `T` (i.e. `TradePartner[]`), but accept a field of type `V`
 * (i.e. `string`).
 *
 * The caller has to tell us how to turn `T` into `V`, which is usually a
 * lambda like `t => t.id`.
 */
export function BoundSelectField<T, V extends Value>(props: BoundSelectFieldProps<T, V>): JSX.Element;
export function BoundSelectField<T extends HasIdAndName<V>, V extends Value>(
  props: Optional<BoundSelectFieldProps<T, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element;
export function BoundSelectField<T extends object, V extends Value>(
  props: Optional<BoundSelectFieldProps<T, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const {
    field,
    options,
    readOnly,
    getOptionValue = (opt: T) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: T) => (opt as any).name, // if unset, assume O implements HasName
    onSelect = (value) => field.set(value),
    label = defaultLabel(field.key),
    onBlur,
    onFocus,
    ...others
  } = props;
  const testId = useTestIds(props, defaultTestId(label));
  return (
    <Observer>
      {() => (
        <SelectField<T, V>
          label={label}
          value={field.value ?? undefined}
          onSelect={(value, opt) => {
            onSelect(value, opt);
            field.maybeAutoSave();
          }}
          options={options}
          readOnly={readOnly ?? field.readOnly}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          required={field.required}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          onBlur={() => {
            field.blur();
            maybeCall(onBlur);
          }}
          onFocus={() => {
            field.focus();
            maybeCall(onFocus);
          }}
          {...others}
          {...testId}
        />
      )}
    </Observer>
  );
}
