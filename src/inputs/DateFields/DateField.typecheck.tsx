import { type ComponentProps } from "react";
import { BoundDateField, BoundDateRangeField, DateField, DateRangeField, type DateRange, type PlainDate } from "src";

type Assert<T extends true> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;
type IsEqual<Left, Right> = [Left] extends [Right] ? ([Right] extends [Left] ? true : false) : false;

/** Compile-time guard for DateField JSX contextual typing. */
export function assertDateFieldContextualTyping(
  selectedDate: PlainDate | undefined,
  selectedRange: DateRange | undefined,
) {
  function setSelectedDate(value: PlainDate | undefined) {
    return value;
  }

  function setSelectedRange(value: DateRange | undefined) {
    return value;
  }

  return (
    <>
      <DateField
        label="Schedule Rerun Date"
        value={selectedDate}
        onChange={(date) => {
          const dateIsNotAny: Assert<IsAny<typeof date> extends false ? true : false> = true;
          const dateMatches: Assert<IsEqual<typeof date, PlainDate | undefined>> = true;

          void dateIsNotAny;
          void dateMatches;

          setSelectedDate(date ?? undefined);
        }}
      />
      <DateRangeField
        label="Schedule Rerun Date Range"
        value={selectedRange}
        onChange={(range) => {
          const rangeIsNotAny: Assert<IsAny<typeof range> extends false ? true : false> = true;
          const rangeMatches: Assert<IsEqual<typeof range, DateRange | undefined>> = true;

          void rangeIsNotAny;
          void rangeMatches;

          setSelectedRange(range ?? undefined);
        }}
      />
    </>
  );
}

type DateFieldOnChange = ComponentProps<typeof DateField>["onChange"];
type DateRangeFieldOnChange = ComponentProps<typeof DateRangeField>["onChange"];
type BoundDateFieldOnChange = NonNullable<ComponentProps<typeof BoundDateField>["onChange"]>;
type BoundDateRangeFieldOnChange = NonNullable<ComponentProps<typeof BoundDateRangeField>["onChange"]>;

const dateFieldOnChangeMatches: Assert<IsEqual<Parameters<DateFieldOnChange>[0], PlainDate | undefined>> = true;
const dateRangeFieldOnChangeMatches: Assert<IsEqual<Parameters<DateRangeFieldOnChange>[0], DateRange | undefined>> =
  true;
const boundDateFieldOnChangeMatches: Assert<IsEqual<Parameters<BoundDateFieldOnChange>[0], PlainDate | undefined>> =
  true;
const boundDateRangeFieldOnChangeMatches: Assert<
  IsEqual<Parameters<BoundDateRangeFieldOnChange>[0], DateRange | undefined>
> = true;

void dateFieldOnChangeMatches;
void dateRangeFieldOnChangeMatches;
void boundDateFieldOnChangeMatches;
void boundDateRangeFieldOnChangeMatches;
