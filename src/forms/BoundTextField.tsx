import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Only } from "src/Css";
import { TextField, TextFieldProps } from "src/inputs";
import { TextFieldXss } from "src/interfaces";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundTextFieldProps<X> = Omit<TextFieldProps<X>, "value" | "onChange" | "label"> & {
  // Make optional as it'll create a label from the field's key if not present
  label?: string;
  field: FieldState<string | null | undefined>;
  // Optional in case the page wants extra behavior
  onChange?: (value: string | undefined) => void;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundTextField<X extends Only<TextFieldXss, X>>(props: BoundTextFieldProps<X>) {
  const {
    field,
    readOnly,
    onBlur,
    onFocus,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key),
    onEnter,
    ...others
  } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <TextField
          label={label}
          value={field.value || undefined}
          onChange={onChange}
          readOnly={readOnly ?? field.readOnly}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          required={field.required}
          onBlur={() => {
            maybeCall(onBlur);
            field.blur();
          }}
          onFocus={() => {
            maybeCall(onFocus);
            field.focus();
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
