import { format, parse } from "date-fns";
import { useState } from "react";
import { DateFieldProps } from "src/inputs";
import { maybeCall, useTestIds } from "src/utils";

/** Mocks out `DateField` as a text `<input>` field. */
export function DateField(props: DateFieldProps) {
  const { onChange = () => {}, errorMsg, onBlur, onFocus } = props;
  const [value, setValue] = useState(props.value ? format(props.value, "MM/dd/yy") : "");
  const tid = useTestIds(props, "date");
  return (
    <input
      {...tid}
      data-error={!!errorMsg}
      value={value}
      onChange={(e) => {
        const { value } = e.target;
        setValue(value);
        onChange(parse(value, "MM/dd/yy", new Date()));
      }}
      onBlur={() => maybeCall(onBlur)}
      onFocus={() => maybeCall(onFocus)}
      disabled={!!props.disabled}
      readOnly={!!props.readOnly}
      data-disabled-days={JSON.stringify(props.disabledDays)}
    />
  );
}
