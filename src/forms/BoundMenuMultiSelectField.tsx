import type { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import type { JSX } from "react";
import { MenuMultiSelectField, type MenuMultiSelectFieldProps } from "src/inputs/MenuSelectField/MenuMultiSelectField";
import type { Value } from "src/inputs/Value";
import { defaultLabel } from "src/utils/defaultLabel";
import { maybeCall } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type BoundMenuMultiSelectFieldProps<O, V extends Value> = Omit<
  MenuMultiSelectFieldProps<O, V>,
  "values" | "onSelect" | "label"
> & {
  field: FieldState<V[] | null | undefined>;
  /** Optional, to do more than `field.set`. */
  onSelect?: (values: V[], opts: O[]) => void;
  /** Defaults to the humanized field key. */
  label?: string;
};

/** Binds `MenuMultiSelectField` to a form field. */
export function BoundMenuMultiSelectField<O, V extends Value>(
  props: BoundMenuMultiSelectFieldProps<O, V>,
): JSX.Element {
  const testId = useTestIds(props, props.field.key);
  return (
    <Observer>
      {() => {
        const { field, readOnly, onBlur, onFocus, onSelect, label, ...others } = props;
        return (
          <MenuMultiSelectField<O, V>
            label={label ?? defaultLabel(field.key)}
            readOnly={readOnly ?? field.readOnly}
            errorMsg={field.touched ? field.errors.join(" ") : undefined}
            required={field.required}
            values={field.value ?? []}
            onBlur={() => {
              field.blur();
              maybeCall(onBlur);
            }}
            onFocus={() => {
              field.focus();
              maybeCall(onFocus);
            }}
            onSelect={(values, opts) => {
              if (onSelect) onSelect(values, opts);
              else field.set(values);
              field.maybeAutoSave();
            }}
            {...others}
            {...testId}
          />
        );
      }}
    </Observer>
  );
}
