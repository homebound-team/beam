import { Key } from "react";
import { SelectFieldProps } from "src/inputs";
import { useTestIds } from "src/utils";

export function SelectField<T extends object, V extends Key>(props: SelectFieldProps<T, V>) {
  const {
    getOptionValue = (o) => (o as any).id, // if unset, assume O implements HasId
    getOptionLabel = (o) => (o as any).name, // if unset, assume O implements HasName
    value,
    options,
    onSelect,
    readOnly = false,
    errorMsg,
    onBlur,
  } = props;
  const tid = useTestIds(props, "select");

  return (
    <select
      {...tid}
      value={
        // @ts-ignore - allow `value` to be seen as a string
        value !== undefined && value !== ""
          ? getOptionValue(options.find((o) => getOptionValue(o) === value) || options[0])
          : ""
      }
      onChange={(e) => {
        const option = options.find((o) => `${getOptionValue(o)}` === e.target.value) || options[0];
        onSelect(getOptionValue(option), option);
      }}
      onBlur={onBlur}
      // Read Only does not apply to `select` fields, instead we'll add in disabled for tests to verify.
      disabled={readOnly}
      data-error={!!errorMsg}
      data-errormsg={errorMsg}
      data-readonly={readOnly}
    >
      <option disabled value=""></option>
      {options.map((option, i) => {
        return (
          <option key={i} value={`${getOptionValue(option)}`}>
            {getOptionLabel(option)}
          </option>
        );
      })}
    </select>
  );
}
