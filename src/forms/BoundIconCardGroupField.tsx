import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { IconCardGroup, IconCardGroupProps } from "src/inputs/IconCardGroup";
import { useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { Value } from "src/inputs";

export type BoundIconCardGroupFieldProps<V extends Value> = Omit<
  IconCardGroupProps<V>,
  "label" | "values" | "onChange"
> & {
  field: FieldState<V[] | null | undefined>;
  /** Make optional so that callers can override if they want to. */
  onChange?: (values: V[]) => void;
  label?: string;
};

/** Wraps `IconCardGroup` and binds it to a form field. */
export function BoundIconCardGroupField<V extends Value>(props: BoundIconCardGroupFieldProps<V>) {
  const { field, onChange = (value) => field.set(value), label = defaultLabel(field.key), ...others } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <IconCardGroup
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
