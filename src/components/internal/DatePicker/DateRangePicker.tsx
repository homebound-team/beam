import React from "react";
import { DayPicker, Matcher } from "react-day-picker";
import { Day } from "src/components/internal/DatePicker/Day";
import { Header } from "src/components/internal/DatePicker/Header";
import { WeekHeader } from "src/components/internal/DatePicker/WeekHeader";
import { Css } from "src/Css";
import { DateRange } from "src/types";
import { useTestIds } from "src/utils";
import "./DatePicker.css";

export interface DateRangePickerProps {
  range: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  disabledDays?: Matcher | Matcher[];
  dottedDays?: Matcher[];
}

export function DateRangePicker(props: DateRangePickerProps) {
  const { range, onSelect, disabledDays, dottedDays } = props;
  const tid = useTestIds(props, "datePicker");

  return (
    <div css={Css.dib.bgWhite.xs.$} {...tid}>
      <DayPicker
        mode="range"
        selected={range}
        components={{ Caption: Header, Head: WeekHeader, Day }}
        defaultMonth={range?.to ?? new Date()}
        onSelect={(selection, day, activeModifiers) => {
          // Disallow returning disabled dates.
          if (activeModifiers.disabled) return;
          onSelect(selection);
        }}
        disabled={disabledDays}
        modifiers={{ indicatorDot: dottedDays ?? [] }}
      />
    </div>
  );
}
