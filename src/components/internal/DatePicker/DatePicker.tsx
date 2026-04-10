import { DayPicker } from "react-day-picker";
import { Day } from "src/components/internal/DatePicker/Day";
import { Header, YearSkipHeader } from "src/components/internal/DatePicker/Header";
import { WeekHeader } from "src/components/internal/DatePicker/WeekHeader";
import { Css } from "src/Css";
import { type DayMatcher, type PlainDate } from "src/types";
import { useTestIds } from "src/utils";
import {
  dayMatchersToDayPickerMatchers,
  jsDateToPlainDate,
  plainDateToJsDate,
  todayPlainDate,
} from "src/utils/plainDate";
import "./DatePicker.css";

export interface DatePickerProps {
  value?: PlainDate;
  onSelect: (value: PlainDate) => void;
  disabledDays?: DayMatcher | DayMatcher[];
  dottedDays?: DayMatcher[];
  useYearPicker?: boolean;
}

export function DatePicker(props: DatePickerProps) {
  const { value, onSelect, disabledDays, dottedDays, useYearPicker } = props;
  const tid = useTestIds(props, "datePicker");

  return (
    <div css={Css.dib.bgWhite.xs.$} {...tid}>
      <DayPicker
        components={{ Caption: useYearPicker ? YearSkipHeader : Header, Head: WeekHeader, Day }}
        // DatePicker only allows for a single date to be `selected` (per our props) though DayPicker expects an array of dates
        selected={value ? [plainDateToJsDate(value)] : []}
        defaultMonth={plainDateToJsDate(value ?? todayPlainDate())}
        onDayClick={(day, modifiers) => {
          if (modifiers.disabled) return;
          // Set the day value
          onSelect(jsDateToPlainDate(day));
        }}
        disabled={dayMatchersToDayPickerMatchers(disabledDays)}
        modifiers={{ indicatorDot: dayMatchersToDayPickerMatchers(dottedDays) ?? [] }}
      />
    </div>
  );
}
