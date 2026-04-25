import {
  dateMatcherToDayPickerMatcher,
  dateMatchersToDayPickerMatchers,
  dateRangeToJsDateRange,
  plainDateToJsDate,
} from "src/components/internal/DatePicker/dates";
import { jan1, jan2, jan3, jan4 } from "src/utils/testDates";

describe("dates", () => {
  describe("dateMatcherToDayPickerMatcher", () => {
    it("converts each supported matcher shape", () => {
      const plainDateMatcher = dateMatcherToDayPickerMatcher(jan1);
      const plainDateArrayMatcher = dateMatcherToDayPickerMatcher([jan1, jan2]);
      const dateRangeMatcher = dateMatcherToDayPickerMatcher({ from: jan2, to: jan4 });
      const functionMatcher = dateMatcherToDayPickerMatcher(function isJan3(date) {
        return date.equals(jan3);
      });

      expect(plainDateMatcher).toEqual(plainDateToJsDate(jan1));
      expect(plainDateArrayMatcher).toEqual([plainDateToJsDate(jan1), plainDateToJsDate(jan2)]);
      expect(dateRangeMatcher).toEqual(dateRangeToJsDateRange({ from: jan2, to: jan4 }));
      expect((functionMatcher as (date: Date) => boolean)(plainDateToJsDate(jan3))).toEqual(true);
      expect((functionMatcher as (date: Date) => boolean)(plainDateToJsDate(jan4))).toEqual(false);
    });
  });

  describe("dateMatchersToDayPickerMatchers", () => {
    it("supports arrays of Beam matchers", () => {
      expect(dateMatchersToDayPickerMatchers([jan1, [jan2, jan3], { from: jan3, to: jan4 }])).toEqual([
        plainDateToJsDate(jan1),
        [plainDateToJsDate(jan2), plainDateToJsDate(jan3)],
        dateRangeToJsDateRange({ from: jan3, to: jan4 }),
      ]);
    });

    it("returns undefined when no matchers are provided", () => {
      expect(dateMatchersToDayPickerMatchers(undefined)).toEqual(undefined);
    });
  });
});
