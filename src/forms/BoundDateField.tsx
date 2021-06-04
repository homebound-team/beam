import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { DateField, DateFieldProps } from "src/inputs";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundDateFieldProps = Omit<DateFieldProps, "value" | "onChange" | "onBlur" | "onFocus"> & {
  field: FieldState<Date | null | undefined>;
  // Optional in case the page wants extra behavior
  onChange?: (value: Date) => void;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundDateField(props: BoundDateFieldProps) {
  const { field, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <DateField
          label={label}
          value={field.value || undefined}
          onChange={onChange}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          onBlur={() => field.blur()}
          onFocus={() => field.focus()}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
