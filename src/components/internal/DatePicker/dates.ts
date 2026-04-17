import { type DateRange as DayPickerDateRange, type Matcher } from "react-day-picker";
import { type DateMatcher, type DateRange, type PlainDate } from "src/types";
import { isPlainDate, jsDateToPlainDate } from "src/utils/plainDate";

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

export function dateMatcherToDayPickerMatcher(matcher: DateMatcher): Matcher {
  if (typeof matcher === "function") {
    return function dayPickerMatcher(date: Date) {
      return matcher(jsDateToPlainDate(date));
    };
  }

  if (Array.isArray(matcher)) {
    return matcher.map(plainDateToJsDate);
  }

  if (isPlainDate(matcher)) {
    return plainDateToJsDate(matcher);
  }

  return {
    from: matcher.from ? plainDateToJsDate(matcher.from) : undefined,
    to: matcher.to ? plainDateToJsDate(matcher.to) : undefined,
  };
}

export function dateMatchersToDayPickerMatchers(
  matchers: DateMatcher | DateMatcher[] | undefined,
): Matcher | Matcher[] | undefined {
  if (matchers === undefined) return undefined;
  return Array.isArray(matchers)
    ? matchers.map(dateMatcherToDayPickerMatcher)
    : dateMatcherToDayPickerMatcher(matchers);
}
