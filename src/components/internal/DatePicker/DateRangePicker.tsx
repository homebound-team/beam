import { DayPicker } from "react-day-picker";
import {
  dateMatchersToDayPickerMatchers,
  dateRangeToJsDateRange,
  jsDateRangeToDateRange,
  plainDateToJsDate,
} from "src/components/internal/DatePicker/dates";
import { Day } from "src/components/internal/DatePicker/Day";
import { Header, YearSkipHeader } from "src/components/internal/DatePicker/Header";
import { WeekHeader } from "src/components/internal/DatePicker/WeekHeader";
import { Css } from "src/Css";
import { type DateMatcher, type DateRange } from "src/types";
import { useTestIds } from "src/utils";
import { todayPlainDate } from "src/utils/plainDate";
import "./DatePicker.css";

export type DateRangePickerProps = {
  range: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  disabledDays?: DateMatcher | DateMatcher[];
  dottedDays?: DateMatcher | DateMatcher[];
  useYearPicker?: boolean;
};

export function DateRangePicker(props: DateRangePickerProps) {
  const { range, onSelect, disabledDays, dottedDays, useYearPicker } = props;
  const tid = useTestIds(props, "datePicker");

  return (
    <div css={Css.dib.bgWhite.xs.$} {...tid}>
      <DayPicker
        mode="range"
        selected={dateRangeToJsDateRange(range)}
        components={{ Caption: useYearPicker ? YearSkipHeader : Header, Head: WeekHeader, Day }}
        defaultMonth={plainDateToJsDate(range?.to ?? range?.from ?? todayPlainDate())}
        onSelect={(selection, day, activeModifiers) => {
          // Disallow returning disabled dates.
          if (activeModifiers.disabled) return;
          onSelect(jsDateRangeToDateRange(selection));
        }}
        disabled={dateMatchersToDayPickerMatchers(disabledDays)}
        modifiers={{ indicatorDot: dateMatchersToDayPickerMatchers(dottedDays) ?? [] }}
      />
    </div>
  );
}
