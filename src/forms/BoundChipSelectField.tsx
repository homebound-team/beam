import { FieldState } from "@homebound/form-state/dist/formState";
import { Observer } from "mobx-react";
import { Value } from "src/inputs";
import { ChipSelectField, ChipSelectFieldProps } from "src/inputs/ChipSelectField";
import { HasIdAndName, Optional } from "src/types";
import { maybeCall, useTestIds } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";

interface BoundChipSelectFieldProps<O, V extends Value>
  extends Omit<ChipSelectFieldProps<O, V>, "onSelect" | "label" | "value"> {
  // Allow `onSelect` to be overridden to do more than just `field.set`.
  onSelect?: (option: V | undefined) => void;
  field: FieldState<any, V | null | undefined>;
  label?: string;
}

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
          {...others}
          {...testId}
        />
      )}
    </Observer>
  );
}
