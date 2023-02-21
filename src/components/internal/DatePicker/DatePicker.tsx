import { DayPicker, Matcher } from "react-day-picker";
import { Day } from "src/components/internal/DatePicker/Day";
import { Header, PreciseDateHeader, YearSkipHeader } from "src/components/internal/DatePicker/Header";
import { WeekHeader } from "src/components/internal/DatePicker/WeekHeader";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import "./DatePicker.css";

export type YearPicker = "default" | "skip" | "precise";

export interface DatePickerProps {
  value?: Date;
  onSelect: (value: Date) => void;
  disabledDays?: Matcher | Matcher[];
  dottedDays?: Matcher[];
  yearPicker?: YearPicker;
}

export function DatePicker(props: DatePickerProps) {
  const { value, onSelect, disabledDays, dottedDays, yearPicker = "default" } = props;
  const tid = useTestIds(props, "datePicker");

  return (
    <div css={Css.dib.bgWhite.xs.$} {...tid}>
      <DayPicker
        components={{
          Caption:
            (yearPicker === "skip" && YearSkipHeader) || (yearPicker === "precise" && PreciseDateHeader) || Header,
          Head: WeekHeader,
          Day,
        }}
        // DatePicker only allows for a single date to be `selected` (per our props) though DayPicker expects an array of dates
        selected={value ? [value] : []}
        defaultMonth={value ?? new Date()}
        onDayClick={(day, modifiers) => {
          if (modifiers.disabled) return;
          // Set the day value
          onSelect(day);
        }}
        disabled={disabledDays}
        modifiers={{ indicatorDot: dottedDays ?? [] }}
      />
    </div>
  );
}
