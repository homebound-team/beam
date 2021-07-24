import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { useContext } from "react";
import { FormContext } from "src/forms/FormContext";
import { getLabelSuffix } from "src/forms/labelUtils";
import { NumberField, NumberFieldProps } from "src/inputs";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundNumberFieldProps = Omit<NumberFieldProps, "value" | "onChange" | "onBlur" | "onFocus" | "label"> & {
  // Make optional as it'll create a label from the field's key if not present
  label?: string;
  field: FieldState<any, number | null | undefined>;
  // Optional in case the page wants extra behavior
  onChange?: (value: number | undefined) => void;
};

/** Wraps `NumberField` and binds it to a form field. */
export function BoundNumberField(props: BoundNumberFieldProps) {
  const {
    field,
    readOnly,
    onChange = (value) => field.set(value),
    label = defaultLabel(field.key.replace(/InCents$/, "")),
    type = field.key.endsWith("InCents") ? "cents" : undefined,
    ...others
  } = props;
  const settings = useContext(FormContext);
  const testId = useTestIds(props, label || field.key);
  return (
    <Observer>
      {() => (
        <NumberField
          label={label}
          labelSuffix={getLabelSuffix(settings, field)}
          value={typeof field.value === "number" ? field.value : undefined}
          onChange={onChange}
          type={type}
          readOnly={readOnly ?? field.readOnly}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          onFocus={() => field.focus()}
          onBlur={() => field.blur()}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
