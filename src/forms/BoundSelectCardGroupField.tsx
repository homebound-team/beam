import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Value } from "src/inputs";
import { SelectCardGroup, SelectCardGroupProps } from "src/inputs/SelectCardGroup";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundSelectCardGroupFieldProps<V extends Value> = Omit<
  SelectCardGroupProps<V>,
  "label" | "values" | "onChange"
> & {
  field: FieldState<V[] | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: V[]) => void;
  label?: string;
};

/** Wraps `SelectCardGroup` and binds it to a form field. */
export function BoundSelectCardGroupField<V extends Value>(props: BoundSelectCardGroupFieldProps<V>) {
  const { field, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <SelectCardGroup
          label={label}
          values={field.value || []}
          onChange={(values) => {
            // We are triggering blur manually for checkbox fields due to its transactional nature
            onChange(values);
            field.maybeAutoSave();
          }}
          disabled={field.readOnly}
          {...testId}
          {...others}
        />
      )}
    </Observer>
  );
}
