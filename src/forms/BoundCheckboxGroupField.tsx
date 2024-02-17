import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { CheckboxGroup, CheckboxGroupProps } from "src/inputs";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundCheckboxGroupFieldProps = Omit<CheckboxGroupProps, "values" | "onChange" | "label"> & {
  field: FieldState<string[] | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: string[]) => void;
  label?: string;
};

/** Wraps `CheckboxGroup` and binds it to a form field.
 * To make the field agnostic to the order of selected values, add `strictOrder: false` to the field's ObjectConfig */
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
          values={field.value || []}
          onChange={(values) => {
            onChange(values);
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
