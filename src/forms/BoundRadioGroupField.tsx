import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { RadioGroupField, RadioGroupFieldProps } from "src/inputs";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import {defaultTestId} from "../utils/defaultTestId";

export type BoundRadioGroupFieldProps<K extends string> = Omit<
  RadioGroupFieldProps<K>,
  "value" | "onChange" | "label"
> & {
  field: FieldState<any, K | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (value: K) => void;
  label?: string;
};

/** Wraps `TextField` and binds it to a form field. */
export function BoundRadioGroupField<K extends string>(props: BoundRadioGroupFieldProps<K>) {
  const {
    field,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key),
    onBlur,
    onFocus,
    ...others
  } = props;
  const testId = useTestIds(props, defaultTestId(label));
  return (
    <Observer>
      {() => (
        <RadioGroupField<K>
          label={label}
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
