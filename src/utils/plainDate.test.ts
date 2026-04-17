import { formatPlainDate } from "src/utils/plainDate";
import { Temporal } from "temporal-polyfill";

describe("plainDate", () => {
  describe("formatPlainDate", () => {
    it("formats supported date formats", () => {
      const date = Temporal.PlainDate.from("2020-01-02");

      expect({
        short: formatPlainDate(date, "MM/dd/yy"),
        shortYear: formatPlainDate(date, "MM/dd/yyyy"),
        medium: formatPlainDate(date, "EEE, MMM d"),
        long: formatPlainDate(date, "EEEE LLLL d, uuuu"),
        monthYear: formatPlainDate(date, "MMMM yyyy"),
        month: formatPlainDate(date, "MMM"),
        year: formatPlainDate(date, "yyyy"),
        narrowWeekday: formatPlainDate(date, "EEEEE"),
        weekday: formatPlainDate(date, "EEEE"),
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
