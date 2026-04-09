import { type DateRange as DayPickerDateRange, type Matcher } from "react-day-picker";
import { type DateRange, type DayMatcher, type PlainDate } from "src/types";
import { Temporal } from "temporal-polyfill";

export function plainDateToJsDate(date: PlainDate): Date {
  return new Date(date.year, date.month - 1, date.day, 12);
}

export function jsDateToPlainDate(date: Date): PlainDate {
  return new Temporal.PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
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
  return (date: Date) => matcher(jsDateToPlainDate(date));
}

export function dayMatchersToDayPickerMatchers(
  matchers: DayMatcher | DayMatcher[] | undefined,
): Matcher | Matcher[] | undefined {
  if (matchers === undefined) return undefined;
  return Array.isArray(matchers) ? matchers.map(dayMatcherToDayPickerMatcher) : dayMatcherToDayPickerMatcher(matchers);
}

export function todayPlainDate(): PlainDate {
  return Temporal.Now.plainDateISO();
}

export function isPlainDate(value: unknown): value is PlainDate {
  return value instanceof Temporal.PlainDate;
}

export function parsePersistedPlainDate(value: unknown): PlainDate | undefined {
  if (isPlainDate(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return jsDateToPlainDate(value);
  }
  if (typeof value !== "string") return undefined;
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return Temporal.PlainDate.from(value);
    }
  } catch {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : jsDateToPlainDate(date);
}

export function dehydratePlainDate(value: PlainDate | undefined): string | undefined {
  return value?.toString();
}
