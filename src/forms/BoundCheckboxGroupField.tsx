import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { CheckboxGroup, CheckboxGroupProps } from "src/components";
import { useTestIds } from "src/utils";

export type BoundCheckboxGroupFieldProps = Omit<CheckboxGroupProps, "values" | "onChange" | "label"> & {
  field: FieldState<string[] | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: string[]) => void;
  label?: string;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundCheckboxGroupField(props: BoundCheckboxGroupFieldProps) {
  const { field, onChange = (value) => field.set(value), label = field.key, ...others } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <CheckboxGroup
          label={label}
          values={field.value || []}
          onChange={onChange}
          // errorMsg={field.touched ? field.errors.join(" ") : undefined}
          // onBlur={() => field.blur()}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
