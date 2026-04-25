import { useState } from "react";
import { type DateFieldProps } from "src/inputs";
import { dateFormats, formatDate, parseDate } from "src/inputs/DateFields/utils";
import { maybeCall, useTestIds } from "src/utils";

/** Mocks out `DateField` as a text `<input>` field. */
export function DateFieldMock(props: DateFieldProps) {
  const { onChange = () => {}, errorMsg, onBlur, onFocus } = props;
  const [value, setValue] = useState(formatDate(props.value, dateFormats.short));
  const tid = useTestIds(props, "date");
  return (
    <input
      {...tid}
      data-error={!!errorMsg}
      value={value}
      onChange={(e) => {
        const { value } = e.target;
        setValue(value);
        onChange(parseDate(value, dateFormats.short));
      }}
      onBlur={() => maybeCall(onBlur)}
      onFocus={() => maybeCall(onFocus)}
      disabled={!!props.disabled}
      readOnly={!!props.readOnly}
      data-disabled-days={JSON.stringify(props.disabledDays)}
    />
  );
}
