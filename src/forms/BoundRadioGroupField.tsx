import type { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { type RadioFieldOption, RadioGroupField, type RadioGroupFieldProps } from "src/inputs/RadioGroupField";
import { defaultLabel } from "src/utils/defaultLabel";
import { maybeCall } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type BoundRadioGroupFieldProps<K extends string, O extends RadioFieldOption<K> = RadioFieldOption<K>> = Omit<
  RadioGroupFieldProps<K, O>,
  "value" | "onChange" | "label"
> & {
  field: FieldState<K | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (value: K) => void;
  label?: string;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundRadioGroupField<K extends string, O extends RadioFieldOption<K> = RadioFieldOption<K>>(
  props: BoundRadioGroupFieldProps<K, O>,
) {
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
        <RadioGroupField<K, O>
          label={label}
          required={field.required}
          value={field.value || undefined}
          onChange={(value) => {
            onChange(value);
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
