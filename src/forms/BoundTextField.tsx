import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Only } from "src/Css";
import { TextField, TextFieldProps } from "src/inputs";
import { TextFieldXss } from "src/interfaces";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundTextFieldProps<X> = Omit<TextFieldProps<X>, "value" | "onChange" | "onBlur" | "onFocus" | "label"> & {
  // Make optional as it'll create a label from the field's key if not present
  label?: string;
  field: FieldState<any, string | null | undefined>;
  // Optional in case the page wants extra behavior
  onChange?: (value: string | undefined) => void;
  // Callback when the user presses the "Enter" key while focused on the input
  onEnter?: () => void;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundTextField<X extends Only<TextFieldXss, X>>(props: BoundTextFieldProps<X>) {
  const { field, readOnly, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
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
          onBlur={() => field.blur()}
          onFocus={() => field.focus()}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
