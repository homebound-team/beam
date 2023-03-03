import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { DateRangeField, DateRangeFieldProps } from "src/inputs";
import { DateRange } from "src/types";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundDateRangeFieldProps = Omit<DateRangeFieldProps, "label" | "value" | "onChange"> & {
  field: FieldState<DateRange | null | undefined>;
  // Make optional as it'll create a label from the field's key if not present
  label?: string;
  // Optional in case the page wants extra behavior
  onChange?: (value: DateRange | undefined) => void;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundDateRangeField(props: BoundDateRangeFieldProps) {
  const {
    field,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key),
    onBlur,
    onFocus,
    onEnter,
    readOnly,
    ...others
  } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <DateRangeField
          label={label}
          value={field.value || undefined}
          onChange={(value) => {
            onChange(value);
            field.maybeAutoSave();
          }}
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
          readOnly={readOnly || field.readOnly}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
