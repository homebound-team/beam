import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { DateField, DateFieldProps } from "src/inputs";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { defaultTestId } from "src/utils/defaultTestId";

export type BoundDateFieldProps = Omit<DateFieldProps, "label" | "value" | "onChange"> & {
  field: FieldState<any, Date | null | undefined>;
  // Make optional as it'll create a label from the field's key if not present
  label?: string;
  // Optional in case the page wants extra behavior
  onChange?: (value: Date) => void;
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
  const testId = useTestIds(props, defaultTestId(label));
  return (
    <Observer>
      {() => (
        <DateField
          label={label}
          value={field.value || undefined}
          onChange={(value) => {
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
