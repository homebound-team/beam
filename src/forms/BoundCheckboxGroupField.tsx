import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { CheckboxGroup, CheckboxGroupProps } from "src/inputs";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundCheckboxGroupFieldProps = Omit<CheckboxGroupProps, "values" | "onChange" | "label"> & {
  field: FieldState<any, string[] | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: string[]) => void;
  label?: string;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundCheckboxGroupField(props: BoundCheckboxGroupFieldProps) {
  const {
    field,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key),
    onBlur,
    onFocus,
    ...others
  } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <CheckboxGroup
          label={label}
          // Sort the values so that the array's contents can properly assert if the field is dirty no matter which order options are added/removed
          values={field.value?.sort() || []}
          onChange={(values) => {
            onChange(values.sort());
            field.maybeAutoSave();
          }}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          onBlur={() => {
            field.blur();
            maybeCall(onBlur);
          }}
          onFocus={() => {
            field.focus();
            maybeCall(onFocus);
          }}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
