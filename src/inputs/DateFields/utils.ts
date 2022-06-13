import { format as dateFnsFormat, isDate, parse as dateFnsParse } from "date-fns";
import { DateRange } from "src/types";

export type DateFieldMode = "single" | "range";

export const dateFormats = {
  short: "MM/dd/yy",
  medium: "EEE, MMM d",
  long: "EEEE LLLL d, uuuu",
};

export function getDateFormat(format: keyof typeof dateFormats | undefined) {
  return format ? dateFormats[format] : dateFormats.short;
}

export function formatDate(date: Date | DateRange | undefined, format: string, mode: DateFieldMode) {
  if (!date) return "";
  if (mode === "range") {
    const { from, to } = date as DateRange;
    const fromFormatted = from ? dateFnsFormat(from, format) : "";
    const toFormatted = to ? dateFnsFormat(to, format) : "";
    // return `undefined` if both dates are improperly formatted
    return !fromFormatted && !toFormatted ? undefined : `${fromFormatted} - ${toFormatted}`;
  }

  return dateFnsFormat(date as Date, format);
}

export function parseDate(str: string, format: string, mode: DateFieldMode): Date | DateRange | undefined {
  if (mode === "range") {
    const [from = "", to = ""] = str.split("-");
    const fromDate = parseDateString(from.trim(), format);
    const toDate = parseDateString(to.trim(), format);
    // In the event the user mixes up the to/from dates then correct them.
    if (toDate && fromDate && toDate < fromDate) {
      return { from: toDate, to: fromDate };
    }
    // If both dates are undefined, return undefined rather than { from: undefined; to: undefined }
    if (toDate === undefined && fromDate === undefined) {
      return undefined;
    }
    return { from: fromDate, to: toDate };
  }
  return parseDateString(str, format);
}

function parseDateString(str: string, format: string): Date | undefined {
  // Copy/pasted from react-day-picker so that typing "2/2/2" doesn't turn into "02/02/0002"
  const split = str.split("/");
  if (split.length !== 3) {
    return undefined;
  }
  // Wait for the year to be 2 chars
  if (split[2].length !== 2) {
    return undefined;
  }
  const month = parseInt(split[0], 10) - 1;
  const day = parseInt(split[1], 10);
  let year = parseInt(split[2], 10);
  // This is also ~verbatim copy/pasted from react-day-picker
  if (
    isNaN(year) ||
    String(year).length > 4 ||
    isNaN(month) ||
    isNaN(day) ||
    day <= 0 ||
    day > 31 ||
    month < 0 ||
    month >= 12
  ) {
    return undefined;
  }

  const parsed = dateFnsParse(str, format, new Date());
  if (!isValidDate(parsed)) {
    return undefined;
  }
  return parsed;
}

export function isValidDate(d: Date | undefined): boolean {
  return d !== undefined && isDate(d) && d.toString() !== "Invalid Date";
}
