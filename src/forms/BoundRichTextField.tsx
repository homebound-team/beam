import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { RichTextField, RichTextFieldProps } from "src/inputs/RichTextField";
import { maybeCall, useTestIds, defaultLabel, defaultTestId } from "src/utils";

export type BoundRichTextFieldProps = Omit<RichTextFieldProps, "value" | "onChange"> & {
  field: FieldState<any, string | null | undefined>;
  // Optional in case the page wants extra behavior
  onChange?: (value: string | undefined) => void;
};

/** Wraps `RichTextField` and binds it to a form field. */
export function BoundRichTextField(props: BoundRichTextFieldProps) {
  const {
    field,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key),
    readOnly,
    onFocus,
    onBlur,
    ...others
  } = props;
  const testId = useTestIds(props, defaultTestId(label));
  return (
    <Observer>
      {() => (
        <RichTextField
          label={label}
          value={field.value || undefined}
          onChange={onChange}
          // TODO: Potentially support this in the future?
          // errorMsg={field.touched ? field.errors.join(" ") : undefined}
          onBlur={() => {
            field.blur();
            maybeCall(onBlur);
          }}
          onFocus={() => {
            field.focus();
            maybeCall(onFocus);
          }}
          readOnly={readOnly ?? field.readOnly}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
