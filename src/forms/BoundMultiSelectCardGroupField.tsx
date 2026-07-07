import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Value } from "src/inputs";
import { MultiSelectCardGroup } from "src/inputs/SelectCard/MultiSelectCardGroup";
import { MultiSelectCardGroupProps } from "src/inputs/SelectCard/types";
import { DistributiveOmit } from "src/types";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundMultiSelectCardGroupFieldProps<V extends Value> = DistributiveOmit<
  MultiSelectCardGroupProps<V>,
  "label" | "values" | "onChange"
> & {
  field: FieldState<V[] | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: V[]) => void;
  label?: string;
};

/** Wraps `MultiSelectCardGroup` and binds it to a form field.
 * To make the field agnostic to the order of selected values, add `strictOrder: false` to the field's ObjectConfig */
export function BoundMultiSelectCardGroupField<V extends Value>(props: BoundMultiSelectCardGroupFieldProps<V>) {
  const { field, onChange = (values) => field.set(values), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, field.key);

  return (
    <Observer>
      {() => (
        <MultiSelectCardGroup
          {...others}
          label={label}
          values={field.value || []}
          onChange={(values) => {
            onChange(values);
            field.maybeAutoSave();
          }}
          disabled={field.readOnly}
          {...testId}
        />
      )}
    </Observer>
  );
}
