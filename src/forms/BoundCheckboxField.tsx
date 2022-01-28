import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Checkbox, CheckboxProps } from "src/inputs";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundCheckboxFieldProps = Omit<CheckboxProps, "values" | "onChange" | "label"> & {
  field: FieldState<any, boolean | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: boolean) => void;
  label?: string;
};

/** Wraps `Checkbox` and binds it to a form field. */
export function BoundCheckboxField(props: BoundCheckboxFieldProps) {
  const {
    field,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key),
    onFocus,
    onBlur,
    ...others
  } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <Checkbox
          label={label}
          selected={field.value ?? false}
          onChange={(selected) => {
            // We are triggering blur manually for checkbox fields due to its transactional nature
            onChange(selected);
            field.maybeAutoSave();
          }}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          onFocus={() => {
            field.focus();
            maybeCall(onFocus);
          }}
          onBlur={() => {
            field.blur();
            maybeCall(onBlur);
          }}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
