import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Switch, SwitchProps } from "src/inputs";
import { useTestIds, defaultLabel, defaultTestId } from "src/utils";

export type BoundSwitchFieldProps = Omit<SwitchProps, "selected" | "onChange" | "label"> & {
  field: FieldState<any, boolean | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (value: boolean) => void;
  label?: string;
};

/** Wraps `Switch` and binds it to a form field. */
export function BoundSwitchField(props: BoundSwitchFieldProps) {
  const {
    field,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key),
    labelStyle = "form",
    ...others
  } = props;
  const testId = useTestIds(props, defaultTestId(label));
  return (
    <Observer>
      {() => (
        <Switch
          label={label}
          labelStyle={labelStyle}
          selected={field.value ?? false}
          onChange={(selected) => {
            onChange(selected);
            field.maybeAutoSave();
          }}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
