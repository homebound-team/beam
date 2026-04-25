import { DateFieldBase, type DateRangeFieldProps } from "src/inputs/DateFields/DateFieldBase";

export type { DateRangeFieldProps } from "src/inputs/DateFields/DateFieldBase";

export function DateRangeField(props: DateRangeFieldProps) {
  return <DateFieldBase {...props} mode="range" />;
}
