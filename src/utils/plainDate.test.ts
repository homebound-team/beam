import { formatPlainDate } from "src/utils/plainDate";
import { Temporal } from "temporal-polyfill";

describe("plainDate", () => {
  describe("formatPlainDate", () => {
    it("formats supported date formats", () => {
      const date = Temporal.PlainDate.from("2020-01-02");

      expect({
        short: formatPlainDate(date, "shortDate"),
        shortYear: formatPlainDate(date, "date"),
        medium: formatPlainDate(date, "shortWeekdayMonthDay"),
        long: formatPlainDate(date, "longWeekdayMonthDayYear"),
        monthYear: formatPlainDate(date, "monthYear"),
        month: formatPlainDate(date, "shortMonth"),
        year: formatPlainDate(date, "year"),
        narrowWeekday: formatPlainDate(date, "weekdayInitial"),
        weekday: formatPlainDate(date, "weekday"),
      }).toEqual({
        short: "01/02/20",
        shortYear: "01/02/2020",
        medium: "Thu, Jan 2",
        long: "Thursday January 2, 2020",
        monthYear: "January 2020",
        month: "Jan",
        year: "2020",
        narrowWeekday: "T",
        weekday: "Thursday",
      });
    });
  });
});
