import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { Value } from "src/inputs";
import { SelectCardGroup } from "src/inputs/SelectCard/SelectCardGroup";
import { SelectCardGroupProps } from "src/inputs/SelectCard/types";
import { DistributiveOmit } from "src/types";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

export type BoundSelectCardGroupFieldProps<V extends Value> = DistributiveOmit<
  SelectCardGroupProps<V>,
  "label" | "value" | "onChange"
> & {
  field: FieldState<V | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (value: V) => void;
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
          {...others}
          label={label}
          value={field.value ?? undefined}
          onChange={(value) => {
            onChange(value);
            field.maybeAutoSave();
          }}
          disabled={field.readOnly}
          {...testId}
        />
      )}
    </Observer>
  );
}
