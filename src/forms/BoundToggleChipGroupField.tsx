import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { ToggleChipGroup, ToggleChipGroupProps } from "src/inputs";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { defaultTestId } from "../utils/defaultTestId";

export type BoundToggleChipGroupFieldProps = Omit<ToggleChipGroupProps, "values" | "onChange" | "label"> & {
  field: FieldState<any, string[] | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: string[]) => void;
  label?: string;
};

/** Wraps `ToggleChipGroup` and binds it to a form field. */
export function BoundToggleChipGroupField(props: BoundToggleChipGroupFieldProps) {
  const { field, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, defaultTestId(label));
  return (
    <Observer>
      {() => <ToggleChipGroup label={label} values={field.value || []} onChange={onChange} {...testId} {...others} />}
    </Observer>
  );
}
