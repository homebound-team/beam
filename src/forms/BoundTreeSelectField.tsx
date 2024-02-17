import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { TreeSelectField, TreeSelectFieldProps, Value } from "src/inputs";
import { TreeSelectResponse } from "src/inputs/TreeSelectField/utils";
import { HasIdAndName, Optional } from "src/types";
import { maybeCall } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { useTestIds } from "src/utils/useTestIds";

export type BoundTreeSelectFieldProps<O, V extends Value> = Omit<
  TreeSelectFieldProps<O, V>,
  "values" | "onSelect" | "label"
> & {
  // Allow `onSelect` to be overridden to do more than just `field.set`.
  onSelect?: (options: TreeSelectResponse<O, V>) => void;
  field: FieldState<V[] | null | undefined>;
  label?: string;
};

/**
 * Wraps `TreeSelectField` and binds it to a form field.
 *
 * To ease integration with "select this fooId" inputs, we can take a list
 * of objects, `T` (i.e. `TradePartner[]`), but accept a field of type `V`
 * (i.e. `string`).
 *
 * The caller has to tell us how to turn `T` into `V`, which is usually a
 * lambda like `t => t.id`.
 */
export function BoundTreeSelectField<T, V extends Value>(props: BoundTreeSelectFieldProps<T, V>): JSX.Element;
export function BoundTreeSelectField<T extends HasIdAndName<V>, V extends Value>(
  props: Optional<BoundTreeSelectFieldProps<T, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element;
export function BoundTreeSelectField<T extends object, V extends Value>(
  props: Optional<BoundTreeSelectFieldProps<T, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const {
    field,
    options,
    readOnly,
    getOptionValue = (opt: T) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: T) => (opt as any).name, // if unset, assume O implements HasName
    onSelect = (options) => field.set(options.all.values),
    label = defaultLabel(field.key),
    onBlur,
    onFocus,
    ...others
  } = props;
  const testId = useTestIds(props, field.key);
  return (
    <Observer>
      {() => (
        <TreeSelectField<T, V>
          label={label}
          values={field.value ?? undefined}
          onSelect={(options) => {
            onSelect(options);
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
