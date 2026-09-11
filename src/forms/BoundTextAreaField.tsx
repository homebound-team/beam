import type { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import type { Only } from "src/Css";
import { TextAreaField, type TextAreaFieldProps } from "src/inputs/TextAreaField";
import type { TextFieldXss } from "src/interfaces";
import { defaultLabel } from "src/utils/defaultLabel";
import { maybeCall } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type BoundTextAreaFieldProps<X> = Omit<TextAreaFieldProps<X>, "value" | "onChange" | "label"> & {
  // Make optional as it'll create a label from the field's key if not present
  label?: string;
  field: FieldState<string | null | undefined>;
  // Optional in case the page wants extra behavior
  onChange?: (value: string | undefined) => void;
};

/** Wraps `TextAreaField` and binds it to a form field. */
export function BoundTextAreaField<X extends Only<TextFieldXss, X>>(props: BoundTextAreaFieldProps<X>) {
  const {
    field,
    readOnly,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key),
    onFocus,
    onBlur,
    onEnter,
    ...others
  } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <TextAreaField
          label={label}
          value={field.value || undefined}
          onChange={onChange}
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
