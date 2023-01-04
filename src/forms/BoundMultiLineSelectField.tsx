import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { MultiLineSelectField, MultiLineSelectFieldProps, Value } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";
import { maybeCall } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { useTestIds } from "src/utils/useTestIds";

export type BoundMultiLineSelectFieldProps<O, V extends Value> = Omit<
  MultiLineSelectFieldProps<O, V>,
  "values" | "onSelect" | "label"
> & {
  // Allow `onSelect` to be overridden to do more than just `field.set`.
  onSelect?: (values: V[], opts: O[]) => void;
  field: FieldState<any, V[] | null | undefined>;
  label?: string;
};

/**
 * Wraps `MultiLineSelectField` and binds it to a form field.
 */
export function BoundMultiLineSelectField<O, V extends Value>(props: BoundMultiLineSelectFieldProps<O, V>): JSX.Element;
export function BoundMultiLineSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<BoundMultiLineSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element;
export function BoundMultiLineSelectField<O, V extends Value>(
  props: Optional<BoundMultiLineSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const {
    field,
    options,
    readOnly,
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
        <MultiLineSelectField<O, V>
          label={label}
          values={(field.value as V[]) ?? []}
          onSelect={(values, options) => {
            onSelect(values, options);
            field.maybeAutoSave();
          }}
          options={options}
          readOnly={readOnly ?? field.readOnly}
          errorMsg={field.touched ? field.errors.join(" ") : undefined}
          required={field.required}
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
