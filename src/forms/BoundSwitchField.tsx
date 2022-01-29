import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Switch, SwitchProps } from "src/inputs";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundSwitchFieldProps = Omit<SwitchProps, "selected" | "onChange" | "label" | "labelStyle"> & {
  field: FieldState<any, boolean | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (value: boolean) => void;
  label?: string;
};

/** Wraps `Switch` and binds it to a form field. */
export function BoundSwitchField(props: BoundSwitchFieldProps) {
  const { field, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <Switch
          label={label}
          labelStyle="form"
          selected={field.value ?? false}
          onChange={(selected) => {
            onChange(selected);
            field.maybeAutoSave();
          }}
          // errorMsg={field.touched ? field.errors.join(" ") : undefined}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
