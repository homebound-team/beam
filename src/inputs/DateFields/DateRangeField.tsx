import { DateFieldBase, DateRangeFieldBaseProps } from "src/inputs/DateFields/DateFieldBase";

export interface DateRangeFieldProps extends Omit<DateRangeFieldBaseProps, "mode"> {}

export function DateRangeField(props: DateRangeFieldProps) {
  return <DateFieldBase {...props} mode="range" />;
}
