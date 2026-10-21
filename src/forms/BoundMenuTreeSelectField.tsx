import type { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import type { JSX } from "react";
import { MenuTreeSelectField, type MenuTreeSelectFieldProps } from "src/inputs/MenuSelectField/MenuTreeSelectField";
import type { TreeSelectResponse } from "src/inputs/TreeSelectField/utils";
import type { Value } from "src/inputs/Value";
import { defaultLabel } from "src/utils/defaultLabel";
import { maybeCall } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type BoundMenuTreeSelectFieldProps<O, V extends Value> = Omit<
  MenuTreeSelectFieldProps<O, V>,
  "values" | "onSelect" | "label"
> & {
  field: FieldState<V[] | null | undefined>;
  /** Optional, to do more than `field.set(response.all.values)`. */
  onSelect?: (response: TreeSelectResponse<O, V>) => void;
  /** Defaults to the humanized field key. */
  label?: string;
};

/** Binds `MenuTreeSelectField` to a form field. */
export function BoundMenuTreeSelectField<O, V extends Value>(props: BoundMenuTreeSelectFieldProps<O, V>): JSX.Element {
  const testId = useTestIds(props, props.field.key);
  return (
    <Observer>
      {() => {
        const { field, readOnly, onBlur, onFocus, onSelect, label, ...others } = props;
        return (
          <MenuTreeSelectField<O, V>
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
            onSelect={(response) => {
              if (onSelect) onSelect(response);
              else field.set(response.all.values);
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
