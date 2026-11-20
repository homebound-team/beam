import { DateFieldBase, type DateRangeFieldProps } from "src/inputs/DateFields/DateFieldBase";

export type { DateRangeFieldProps } from "src/inputs/DateFields/DateFieldBase";

/** A date input that picks a start and end date from a calendar popover, or accepts a typed range. */
export function DateRangeField(props: DateRangeFieldProps) {
  return <DateFieldBase {...props} mode="range" />;
}
