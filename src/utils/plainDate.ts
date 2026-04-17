import { type PlainDate } from "src/types";
import { Temporal } from "temporal-polyfill";

export type SupportedDateFormat =
  | "MM/dd/yy" // I.e. 01/02/20
  | "MM/dd/yyyy" // I.e. 01/02/2020
  | "EEE, MMM d" // I.e. Thu, Jan 2
  | "EEEE LLLL d, uuuu" // I.e. Thursday January 2, 2020
  | "MMMM yyyy" // I.e. January 2020
  | "MMM" // I.e. Jan
  | "yyyy" // I.e. 2020
  | "EEEEE" // I.e. T
  | "EEEE"; // I.e. Thursday

export function jsDateToPlainDate(date: Date): PlainDate {
  return new Temporal.PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function formatPlainDate(date: PlainDate, format: SupportedDateFormat): string {
  switch (format) {
    case "MM/dd/yy":
      return date.toLocaleString("en-US", plainDateFormatOptions.mmDdYy);
    case "MM/dd/yyyy":
      return date.toLocaleString("en-US", plainDateFormatOptions.mmDdYyyy);
    case "EEE, MMM d":
      return date.toLocaleString("en-US", plainDateFormatOptions.eeeMmmD);
    case "EEEE LLLL d, uuuu":
      return `${date.toLocaleString("en-US", plainDateFormatOptions.eeeeLong)} ${date.toLocaleString("en-US", plainDateFormatOptions.monthLong)} ${date.day}, ${formatYear(date.year)}`;
    case "MMMM yyyy":
      return date.toLocaleString("en-US", plainDateFormatOptions.mmmmYyyy);
    case "MMM":
      return date.toLocaleString("en-US", plainDateFormatOptions.mmm);
    case "yyyy":
      return formatYear(date.year);
    case "EEEEE":
      return date.toLocaleString("en-US", plainDateFormatOptions.eeeeeNarrow);
    case "EEEE":
      return date.toLocaleString("en-US", plainDateFormatOptions.eeeeLong);
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

const plainDateFormatOptions = {
  mmDdYy: { month: "2-digit", day: "2-digit", year: "2-digit" } satisfies Intl.DateTimeFormatOptions,
  mmDdYyyy: { month: "2-digit", day: "2-digit", year: "numeric" } satisfies Intl.DateTimeFormatOptions,
  eeeMmmD: { weekday: "short", month: "short", day: "numeric" } satisfies Intl.DateTimeFormatOptions,
  mmmmYyyy: { month: "long", year: "numeric" } satisfies Intl.DateTimeFormatOptions,
  mmm: { month: "short" } satisfies Intl.DateTimeFormatOptions,
  eeeeeNarrow: { weekday: "narrow" } satisfies Intl.DateTimeFormatOptions,
  eeeeLong: { weekday: "long" } satisfies Intl.DateTimeFormatOptions,
  monthLong: { month: "long" } satisfies Intl.DateTimeFormatOptions,
};

function padNumber(value: number, length: number): string {
  return Math.abs(value).toString().padStart(length, "0");
}

function formatYear(year: number): string {
  return `${year < 0 ? "-" : ""}${padNumber(year, 4)}`;
}
