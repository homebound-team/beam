import { Key, useState } from "react";
import { SelectFieldProps } from "src/inputs";
import { useTestIds } from "src/utils";

/** Mocks out `SelectField` as a `<select>` field. */
export function SelectField<O extends object, V extends Key>(props: SelectFieldProps<O, V>) {
  const {
    getOptionValue = (o) => (o as any).id, // if unset, assume O implements HasId
    getOptionLabel = (o) => (o as any).name, // if unset, assume O implements HasName
    value,
    options: maybeOptions,
    onSelect,
    readOnly = false,
    errorMsg,
    onBlur,
    onFocus,
    disabled,
    disabledOptions = [],
  } = props;
  const tid = useTestIds(props, "select");

  const [options, setOptions] = useState(Array.isArray(maybeOptions) ? maybeOptions : maybeOptions.initial);
  const currentOption = options.find((o) => getOptionValue(o) === value) || options[0];

  return (
    <select
      {...tid}
      value={
        // @ts-ignore - allow `value` to be seen as a string
        value !== undefined && value !== "" && currentOption ? getOptionValue(currentOption) : ""
      }
      onChange={(e) => {
        const option = options.find((o) => `${getOptionValue(o)}` === e.target.value) || options[0];
        onSelect(getOptionValue(option), option);
      }}
      onFocus={async () => {
        if (!Array.isArray(maybeOptions)) {
          const result = await maybeOptions.load();
          setOptions(result.options);
        }
        if (!readOnly && onFocus) onFocus();
      }}
      onBlur={() => {
        if (!readOnly && onBlur) onBlur();
      }}
      // Read Only does not apply to `select` fields, instead we'll add in disabled for tests to verify.
      disabled={!!(disabled || readOnly)}
      data-error={!!errorMsg}
      data-errormsg={errorMsg}
      data-readonly={readOnly}
    >
      <option disabled value=""></option>
      {options.map((option, i) => {
        return (
          <option
            key={i}
            value={`${getOptionValue(option)}`}
            disabled={disabledOptions.includes(getOptionValue(option))}
          >
            {getOptionLabel(option)}
          </option>
        );
      })}
    </select>
  );
}
