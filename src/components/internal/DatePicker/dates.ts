import { type DateRange as DayPickerDateRange, type Matcher } from "react-day-picker";
import { type DateRange, type DayMatcher, type PlainDate } from "src/types";
import { jsDateToPlainDate } from "src/utils/plainDate";

export function plainDateToJsDate(date: PlainDate): Date {
  return new Date(date.year, date.month - 1, date.day, 12);
}

export function dateRangeToJsDateRange(range: DateRange | undefined): DayPickerDateRange | undefined {
  if (!range) return undefined;
  return {
    from: range.from ? plainDateToJsDate(range.from) : undefined,
    to: range.to ? plainDateToJsDate(range.to) : undefined,
  };
}

export function jsDateRangeToDateRange(range: DayPickerDateRange | undefined): DateRange | undefined {
  if (!range) return undefined;
  return {
    from: range.from ? jsDateToPlainDate(range.from) : undefined,
    to: range.to ? jsDateToPlainDate(range.to) : undefined,
  };
}

export function dayMatcherToDayPickerMatcher(matcher: DayMatcher): Matcher {
  return function dayPickerMatcher(date: Date) {
    return matcher(jsDateToPlainDate(date));
  };
}

export function dayMatchersToDayPickerMatchers(
  matchers: DayMatcher | DayMatcher[] | undefined,
): Matcher | Matcher[] | undefined {
  if (matchers === undefined) return undefined;
  return Array.isArray(matchers) ? matchers.map(dayMatcherToDayPickerMatcher) : dayMatcherToDayPickerMatcher(matchers);
}
