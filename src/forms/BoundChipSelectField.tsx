import type { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import type { JSX } from "react";
import { ChipSelectField, type ChipSelectFieldProps } from "src/inputs/ChipSelectField";
import type { Value } from "src/inputs/Value";
import type { HasIdAndName, Optional } from "src/types";
import { defaultLabel } from "src/utils/defaultLabel";
import { maybeCall } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

type BoundChipSelectFieldProps<O, V extends Value> = {
  // Allow `onSelect` to be overridden to do more than just `field.set`.
  onSelect?: (option: V | undefined) => void;
  field: FieldState<V | null | undefined>;
  label?: string;
} & Omit<ChipSelectFieldProps<O, V>, "onSelect" | "label" | "value">;

export function BoundChipSelectField<O, V extends Value>(props: BoundChipSelectFieldProps<O, V>): JSX.Element;
export function BoundChipSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<BoundChipSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function BoundChipSelectField<O, V extends Value>(
  props: Optional<BoundChipSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const {
    field,
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName
    onSelect = (value) => field.set(value),
    label = defaultLabel(field.key),
    onBlur,
    onFocus,
    onCreateNew,
    ...others
  } = props;
  const testId = useTestIds(props, field.key);

  return (
    <Observer>
      {() => (
        <ChipSelectField
          label={label}
          value={field.value ?? undefined}
          onSelect={(value) => {
            onSelect(value);
            field.maybeAutoSave();
          }}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          onBlur={() => {
            field.blur();
            maybeCall(onBlur);
          }}
          onFocus={() => {
            field.focus();
            maybeCall(onFocus);
          }}
          onCreateNew={
            onCreateNew
              ? async (v) => {
                  await onCreateNew(v);
                  field.maybeAutoSave();
                }
              : undefined
          }
          {...others}
          {...testId}
        />
      )}
    </Observer>
  );
}
