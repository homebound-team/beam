import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { NumberField, NumberFieldProps } from "src/components/NumberField";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundNumberFieldProps = Omit<NumberFieldProps, "value" | "onChange"> & {
  field: FieldState<number | null | undefined>;
  // Optional in case the page wants extra behavior
  onChange?: (value: number | undefined) => void;
};

/** Wraps `NumberField` and binds it to a form field. */
export function BoundNumberField(props: BoundNumberFieldProps) {
  const { field, readOnly, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <NumberField
          label={label}
          value={field.value || undefined}
          onChange={onChange}
          readOnly={readOnly ?? field.readOnly}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          onBlur={() => field.blur()}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
