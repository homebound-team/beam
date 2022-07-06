import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Only } from "src/Css";
import { TextAreaField, TextAreaFieldProps } from "src/inputs";
import { TextFieldXss } from "src/interfaces";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { defaultTestId } from "../utils/defaultTestId";

export type BoundTextAreaFieldProps<X> = Omit<TextAreaFieldProps<X>, "value" | "onChange" | "label"> & {
  // Make optional as it'll create a label from the field's key if not present
  label?: string;
  field: FieldState<any, string | null | undefined>;
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
  const testId = useTestIds(props, defaultTestId(label));
  return (
    <Observer>
      {() => (
        <TextAreaField
          label={label}
          value={field.value || undefined}
          onChange={onChange}
          readOnly={readOnly ?? field.readOnly}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
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
