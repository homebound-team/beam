import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { NumberField, NumberFieldProps } from "src/inputs/NumberField";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundNumberFieldProps = Omit<NumberFieldProps, "value" | "onChange" | "label"> & {
  // Make optional as it'll create a label from the field's key if not present
  label?: string;
  field: FieldState<number | null | undefined>;
  // Optional in case the page wants extra behavior
  onChange?: (value: number | undefined) => void;
};

/** Wraps `NumberField` and binds it to a form field. */
export function BoundNumberField(props: BoundNumberFieldProps) {
  const {
    field,
    readOnly,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key.replace(/InCents$/, "")),
    type = field.key.endsWith("InCents") ? "cents" : undefined,
    onFocus,
    onBlur,
    onEnter,
    ...others
  } = props;
  const testId = useTestIds(props, label || field.key);
  return (
    <Observer>
      {() => (
        <NumberField
          label={label}
          value={typeof field.value === "number" ? field.value : undefined}
          onChange={onChange}
          type={type}
          readOnly={readOnly ?? field.readOnly}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          required={field.required}
          onFocus={() => {
            field.focus();
            maybeCall(onFocus);
          }}
          onBlur={() => {
            field.blur();
            maybeCall(onBlur);
          }}
          onEnter={() => {
            maybeCall(onEnter);
            field.maybeAutoSave();
          }}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
