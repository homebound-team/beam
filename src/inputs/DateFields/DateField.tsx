import { DateFieldMock } from "src/inputs/DateFields/DateField.mock";
import { DateFieldBase, DateSingleFieldBaseProps } from "src/inputs/DateFields/DateFieldBase";
import { withTestMock } from "src/utils/withTestMock";

export interface DateFieldProps extends Omit<DateSingleFieldBaseProps, "mode"> {}

export function DateFieldImpl(props: DateFieldProps) {
  return <DateFieldBase {...props} mode="single" />;
}

export const DateField = withTestMock(DateFieldImpl, DateFieldMock);
