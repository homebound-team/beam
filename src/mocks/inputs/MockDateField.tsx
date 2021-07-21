import { format, parse } from "date-fns";
import { DateFieldProps } from "src/inputs";
import { useTestIds } from "src/utils";

export function DateField(props: DateFieldProps) {
  const { value, onChange = () => {}, errorMsg } = props;
  const tid = useTestIds(props, "date");
  return (
    <input
      {...tid}
      // data-readonly={readOnly}
      data-error={!!errorMsg}
      value={value ? format(value, "MM/dd/yy") : ""}
      onChange={(e) => onChange(parse(e.target.value, "MM/dd/yy", new Date()))}
    />
  );
}
