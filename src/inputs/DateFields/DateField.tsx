import { DateFieldMock } from "src/inputs/DateFields/DateField.mock";
import { DateFieldBase, type DateFieldProps } from "src/inputs/DateFields/DateFieldBase";
import { withTestMock } from "src/utils/withTestMock";

export type { DateFieldProps } from "src/inputs/DateFields/DateFieldBase";

export function DateFieldImpl(props: DateFieldProps) {
  return <DateFieldBase {...props} mode="single" />;
}

export const DateField = withTestMock(DateFieldImpl, DateFieldMock);
