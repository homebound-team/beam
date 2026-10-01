import type { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import type { JSX } from "react";
import { MenuSelectField, type MenuSelectFieldProps } from "src/inputs/MenuSelectField/MenuSelectField";
import type { Value } from "src/inputs/Value";
import { defaultLabel } from "src/utils/defaultLabel";
import { maybeCall } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type BoundMenuSelectFieldProps<O, V extends Value> = Omit<
  MenuSelectFieldProps<O, V>,
  "value" | "onSelect" | "label"
> & {
  field: FieldState<V | null | undefined>;
  /** Optional, to do more than `field.set`. */
  onSelect?: (value: V | undefined, opt: O | undefined) => void;
  /** Defaults to the humanized field key. */
  label?: string;
};

/** Binds `MenuSelectField` to a form field. */
export function BoundMenuSelectField<O, V extends Value>(props: BoundMenuSelectFieldProps<O, V>): JSX.Element {
  const testId = useTestIds(props, props.field.key);
  return (
    <Observer>
      {() => {
        const { field, readOnly, onBlur, onFocus, onSelect, label, ...others } = props;
        return (
          <MenuSelectField<O, V>
            label={label ?? defaultLabel(field.key)}
            readOnly={readOnly ?? field.readOnly}
            errorMsg={field.touched ? field.errors.join(" ") : undefined}
            required={field.required}
            value={field.value ?? undefined}
            onBlur={() => {
              field.blur();
              maybeCall(onBlur);
            }}
            onFocus={() => {
              field.focus();
              maybeCall(onFocus);
            }}
            onSelect={(value, opt) => {
              if (onSelect) onSelect(value, opt);
              else field.set(value);
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
