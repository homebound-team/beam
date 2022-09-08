import { MultiSelectFieldProps, Value } from "src/inputs";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

/** Mocks out `MultiSelectField` as a multiple `<select>` field. */
export function MultiSelectField<T, V extends Value>(props: MultiSelectFieldProps<T, V>) {
  const {
    getOptionValue = (o) => (o as any).id, // if unset, assume O implements HasId
    getOptionLabel = (o) => (o as any).name, // if unset, assume O implements HasName
    values,
    options,
    onSelect,
    readOnly = false,
    errorMsg,
    onFocus,
    onBlur,
    disabled,
    label,
    disabledOptions = [],
    helperText,
  } = props;
  const tid = useTestIds(props, defaultTestId(label));

  return (
    <label {...tid.label}>
      {label}
      <select
        {...tid}
        // We're cheating and assume the values are strings...what we should really do is either:
        // a) use beam's valueToKey mapping to string-encode any Value, or
        // b) instead of using `values` directly, use the index of each value's `option` in `options`
        value={values as string[]}
        onChange={(e) => {
          const { target } = e;
          const selectedValues: string[] = [...(values as string[])];
          for (let i = 0; i < target.selectedOptions.length; i++) {
            if (selectedValues.includes(target.selectedOptions.item(i)?.value!)) {
              // deSelect if already selected
              selectedValues.splice(selectedValues.indexOf(target.selectedOptions.item(i)?.value!), 1);
            } else {
              // add value
              selectedValues.push(target.selectedOptions.item(i)?.value!);
            }
          }
          const selectedOptions = options.filter((o) => selectedValues.includes(getOptionValue(o)));
          onSelect(
            selectedOptions.map((o) => getOptionValue(o)),
            selectedOptions,
          );
        }}
        multiple
        onFocus={() => {
          if (!readOnly && onFocus) onFocus();
        }}
        onBlur={() => {
          if (!readOnly && onBlur) onBlur();
        }}
        // Read Only does not apply to `select` fields, instead we'll add in disabled for tests to verify.
        disabled={!!(readOnly || disabled)}
        data-error={!!errorMsg}
        data-errormsg={errorMsg}
        data-readonly={readOnly}
      >
        <option disabled value=""></option>
        {options.map((option, i) => {
          return (
            <option key={i} value={getOptionValue(option)} disabled={disabledOptions.includes(getOptionValue(option))}>
              {getOptionLabel(option)}
            </option>
          );
        })}
      </select>
      {helperText && <div {...tid.helperText}>{helperText}</div>}
    </label>
  );
}
