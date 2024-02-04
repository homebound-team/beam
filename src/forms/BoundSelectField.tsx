import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { SelectField, SelectFieldProps, Value } from "src/inputs";
import { maybeCall } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { useTestIds } from "src/utils/useTestIds";
import { defaultOptionLabel, defaultOptionValue } from "src/utils/options";

export type BoundSelectFieldProps<O, V extends Value> = Omit<SelectFieldProps<O, V>, "value" | "onSelect" | "label"> & {
  /** Optional, but available for pages to do more than just `field.set`. */
  onSelect?: (value: V | undefined, opt: O | undefined) => void;
  /** The form field that will be read/write. */
  field: FieldState<V | null | undefined>;
  /** Optional, defaults to the field's humanized key. */
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
export function BoundSelectField<O, V extends Value>(props: BoundSelectFieldProps<O, V>): JSX.Element {
  const {
    field,
    options,
    readOnly,
    onSelect = (value) => field.set(value),
    label = defaultLabel(field.key),
    onBlur,
    onFocus,
    ...others
  } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <SelectField<O, V>
          getOptionValue={defaultOptionValue}
          getOptionLabel={defaultOptionLabel}
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
