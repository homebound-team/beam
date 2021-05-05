import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { TextField, TextFieldProps } from "src/components";

export type BoundTextFieldProps = Omit<TextFieldProps, "value"> & {
  field: FieldState<string | null | undefined>;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundTextField(props: BoundTextFieldProps) {
  const { field, readOnly, onChange = (value) => field.set(value), label = field.key, ...others } = props;
  return (
    <Observer>
      {() => (
        <TextField
          data-testid={field.key}
          label={label}
          value={field.value || undefined}
          onChange={onChange}
          readOnly={readOnly ?? field.readOnly}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          onBlur={() => field.blur()}
          {...others}
        />
      )}
    </Observer>
  );
}
