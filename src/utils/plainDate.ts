import { type PlainDate } from "src/types";
import { Temporal } from "temporal-polyfill";

export type SupportedDateFormat =
  | "shortDate" // I.e. 01/02/20
  | "date" // I.e. 01/02/2020
  | "shortWeekdayMonthDay" // I.e. Thu, Jan 2
  | "longWeekdayMonthDayYear" // I.e. Thursday January 2, 2020
  | "monthYear" // I.e. January 2020
  | "shortMonth" // I.e. Jan
  | "year" // I.e. 2020
  | "weekdayInitial" // I.e. T
  | "weekday"; // I.e. Thursday

export function jsDateToPlainDate(date: Date): PlainDate {
  return new Temporal.PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function formatPlainDate(date: PlainDate, format: SupportedDateFormat): string {
  switch (format) {
    case "shortDate":
      return date.toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
    case "date":
      return date.toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    case "shortWeekdayMonthDay":
      return date.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" });
    case "longWeekdayMonthDayYear":
      return `${date.toLocaleString("en-US", { weekday: "long" })} ${date.toLocaleString("en-US", { month: "long" })} ${date.day}, ${formatYear(date.year)}`;
    case "monthYear":
      return date.toLocaleString("en-US", { month: "long", year: "numeric" });
    case "shortMonth":
      return date.toLocaleString("en-US", { month: "short" });
    case "year":
      return formatYear(date.year);
    case "weekdayInitial":
      return date.toLocaleString("en-US", { weekday: "narrow" });
    case "weekday":
      return date.toLocaleString("en-US", { weekday: "long" });
    default:
      throw new Error(`Unsupported date format: ${format}`);
  }
}

export function todayPlainDate(): PlainDate {
  return Temporal.Now.plainDateISO();
}

export function isPlainDate(value: unknown): value is PlainDate {
  return value instanceof Temporal.PlainDate;
}

/** Accepts both new PlainDate strings and legacy Date-based persisted values. */
export function parsePersistedPlainDate(value: unknown): PlainDate | undefined {
  if (isPlainDate(value)) return value;
  // Some callers hand us already-hydrated Dates, so keep supporting that shape while the migration settles.
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return jsDateToPlainDate(value);
  }
  if (typeof value !== "string") return undefined;

  // Prefer the new YYYY-MM-DD format because it is timezone-free and matches what we now persist.
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return Temporal.PlainDate.from(value);
    }
  } catch {
    return undefined;
  }

  // Fall back to Date parsing so old deep links / session state still survive the PlainDate migration.
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : jsDateToPlainDate(date);
}

export function dehydratePlainDate(value: PlainDate | undefined): string | undefined {
  return value?.toString();
}

function padNumber(value: number, length: number): string {
  return Math.abs(value).toString().padStart(length, "0");
}

function formatYear(year: number): string {
  return `${year < 0 ? "-" : ""}${padNumber(year, 4)}`;
}
