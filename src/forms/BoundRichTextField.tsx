import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { RichTextField, RichTextFieldProps } from "src/components/RichTextField";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundRichTextFieldProps = Omit<RichTextFieldProps, "value" | "onChange" | "onBlur" | "onFocus"> & {
  field: FieldState<any, string | null | undefined>;
  // Optional in case the page wants extra behavior
  onChange?: (value: string | undefined) => void;
};

/** Wraps `RichTextField` and binds it to a form field. */
export function BoundRichTextField(props: BoundRichTextFieldProps) {
  const { field, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <RichTextField
          label={label}
          value={field.value || undefined}
          onChange={onChange}
          // TODO: Potentially support this in the future?
          // errorMsg={field.touched ? field.errors.join(" ") : undefined}
          onBlur={() => field.blur()}
          onFocus={() => field.blur()}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
