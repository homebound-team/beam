import { DateFieldBase, DateSingleFieldBaseProps } from "src/inputs/DateFields/DateFieldBase";

export interface DateFieldProps extends Omit<DateSingleFieldBaseProps, "mode"> {}

export function DateField(props: DateFieldProps) {
  return <DateFieldBase {...props} mode="single" />;
}
