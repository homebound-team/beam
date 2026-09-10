import type { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { DateField } from "src/inputs/DateFields/DateField";
import type { DateFieldProps } from "src/inputs/DateFields/DateFieldBase";
import type { PlainDate } from "src/types";
import { defaultLabel } from "src/utils/defaultLabel";
import { maybeCall } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type BoundDateFieldProps = Omit<DateFieldProps, "label" | "value" | "onChange"> & {
  field: FieldState<PlainDate | null | undefined>;
  // Make optional as it'll create a label from the field's key if not present
  label?: string;
  // Optional in case the page wants extra behavior
  onChange?: (value: PlainDate | undefined) => void;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundDateField(props: BoundDateFieldProps) {
  const {
    field,
    readOnly,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key),
    onBlur,
    onFocus,
    onEnter,
    ...others
  } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <DateField
          label={label}
          value={field.value || undefined}
          onChange={(value: PlainDate | undefined) => {
            onChange(value);
            field.maybeAutoSave();
          }}
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
