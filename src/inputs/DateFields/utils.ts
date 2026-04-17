import { type DateRange, type PlainDate } from "src/types";
import { type SupportedDateFormat, formatPlainDate, isPlainDate, todayPlainDate } from "src/utils/plainDate";
import { Temporal } from "temporal-polyfill";

export type DateFieldMode = "single" | "range";

export const dateFormats = {
  short: "MM/dd/yy",
  medium: "EEE, MMM d",
  long: "EEEE LLLL d, uuuu",
} as const;

export type DateFieldFormat = (typeof dateFormats)[keyof typeof dateFormats];

export function getDateFormat(format: keyof typeof dateFormats | undefined) {
  return format ? dateFormats[format] : dateFormats.short;
}

export function formatDate(date: PlainDate | undefined, format: SupportedDateFormat) {
  if (!date) return "";
  return formatPlainDate(date, format);
}

export function formatDateRange(date: DateRange | undefined, format: SupportedDateFormat) {
  if (!date) return "";
  const { from, to } = date as DateRange;
  const fromFormatted = from ? formatPlainDate(from, format) : "";
  const toFormatted = to ? formatPlainDate(to, format) : "";
  // return `undefined` if both dates are improperly formatted
  return !fromFormatted && !toFormatted ? undefined : `${fromFormatted} - ${toFormatted}`;
}

export function parseDate(str: string, format: DateFieldFormat | "MM/dd/yyyy"): PlainDate | undefined {
  return parseDateString(str, format);
}

export function parseDateRange(str: string, format: DateFieldFormat | "MM/dd/yyyy"): DateRange | undefined {
  const [from = "", to = ""] = str.split("-");
  const fromDate = parseDateString(from.trim(), format);
  const toDate = parseDateString(to.trim(), format);
  // In the event the user mixes up the to/from dates then correct them.
  if (toDate && fromDate && Temporal.PlainDate.compare(toDate, fromDate) < 0) {
    return { from: toDate, to: fromDate };
  }
  // If both dates are undefined, return undefined rather than { from: undefined; to: undefined }
  if (toDate === undefined && fromDate === undefined) {
    return undefined;
  }
  return { from: fromDate, to: toDate };
}

function parseDateString(str: string, format: DateFieldFormat | "MM/dd/yyyy"): PlainDate | undefined {
  if (format !== dateFormats.short && format !== "MM/dd/yyyy") {
    return undefined;
  }

  // Copy/pasted from react-day-picker so that typing "2/2/2" doesn't turn into "02/02/0002"
  const split = str.split("/");
  if (split.length !== 3) {
    return undefined;
  }

  const yearLength = format === dateFormats.short ? 2 : 4;
  if (split[2].length !== yearLength) {
    return undefined;
  }

  const month = parseInt(split[0], 10);
  const day = parseInt(split[1], 10);
  const year = parseInt(split[2], 10);
  // This is also ~verbatim copy/pasted from react-day-picker
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    day <= 0 ||
    day > 31 ||
    month <= 0 ||
    month > 12
  ) {
    return undefined;
  }

  try {
    return Temporal.PlainDate.from({
      year: yearLength === 2 ? normalizeTwoDigitYear(year, todayPlainDate().year) : year,
      month,
      day,
    });
  } catch {
    return undefined;
  }
}

export function isValidDate(d: PlainDate | undefined): boolean {
  return d !== undefined && isPlainDate(d);
}

function normalizeTwoDigitYear(twoDigitYear: number, currentYear: number): number {
  const isCommonEra = currentYear > 0;
  const absCurrentYear = isCommonEra ? currentYear : 1 - currentYear;
  if (absCurrentYear <= 50) {
    return isCommonEra ? twoDigitYear || 100 : 1 - (twoDigitYear || 100);
  }

  const rangeEnd = absCurrentYear + 50;
  const rangeEndCentury = Math.floor(rangeEnd / 100) * 100;
  const isPreviousCentury = twoDigitYear >= rangeEnd % 100;
  const normalizedYear = twoDigitYear + rangeEndCentury - (isPreviousCentury ? 100 : 0);
  return isCommonEra ? normalizedYear : 1 - normalizedYear;
}
