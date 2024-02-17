import { FieldState } from "@homebound/form-state";
import { Observer } from "mobx-react";
import { SelectField, SelectFieldProps, Value } from "src/inputs";
import { HasIdIsh, HasNameIsh, Optional } from "src/types";
import { maybeCall } from "src/utils";
import { defaultLabel } from "src/utils/defaultLabel";
import { useTestIds } from "src/utils/useTestIds";
import { defaultOptionLabel, defaultOptionValue } from "src/utils/options";

export type BoundSelectFieldProps<O, V extends Value> = Omit<SelectFieldProps<O, V>, "value" | "onSelect" | "label"> & {
  /** Optional, to allow `onSelect` to be overridden to do more than just `field.set`. */
  onSelect?: (value: V | undefined, opt: O | undefined) => void;
  /** The field we'll read/write data from. */
  field: FieldState<V | null | undefined>;
  /** An optional label, defaults to the humanized field key, i.e. `authorId` -> `Author`. */
  label?: string;
};

/**
 * Wraps `SelectField` and binds it to a form field.
 *
 * To ease integration with GraphQL inputs that want to put `{ authorId: "a:1" }` on
 * the wire, we generally expect the FieldState type to be a string/tagged id, but the
 * `options` prop to be the full list of id+name options like `AuthorFragment[]`.
 *
 * If `AuthorFragment` type matches `HasIdIsh` and `HasNameIsh`, we'll automatically use
 * the `id` and `name` fields from it, otherwise callers need to provide `getOptionValue`
 * and `getOptionLabel` to adapt the option, i.e. `getOptionLabel={(author) => author.otherName}`.
 *
 * Note: there are four overloads here to handle each combination of "HasIdIsh and HasNameId",
 * "only has HasIdIsh", "only has HasNameIsh", and "neither".
 */
export function BoundSelectField<T extends HasIdIsh<V> & HasNameIsh, V extends Value>(
  props: Optional<BoundSelectFieldProps<T, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element;
export function BoundSelectField<T extends HasIdIsh<V>, V extends Value>(
  props: Optional<BoundSelectFieldProps<T, V>, "getOptionValue">,
): JSX.Element;
export function BoundSelectField<T extends HasNameIsh, V extends Value>(
  props: Optional<BoundSelectFieldProps<T, V>, "getOptionLabel">,
): JSX.Element;
export function BoundSelectField<T, V extends Value>(props: BoundSelectFieldProps<T, V>): JSX.Element;
export function BoundSelectField<T extends object, V extends Value>(
  props: Optional<BoundSelectFieldProps<T, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element {
  const {
    field,
    options,
    readOnly,
    getOptionValue = defaultOptionValue,
    getOptionLabel = defaultOptionLabel,
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
        <SelectField<T, V>
          label={label}
          value={field.value ?? undefined}
          onSelect={(value, opt) => {
            onSelect(value, opt);
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
