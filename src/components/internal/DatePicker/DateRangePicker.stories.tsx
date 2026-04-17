import { type Meta } from "@storybook/react-vite";
import { useState } from "react";
import { DateRangePicker } from "src/components/internal/DatePicker";
import { Css } from "src/Css";
import { jan1, jan10, jan19, jan2, jan29 } from "src/forms/formStateDomain";
import { type DateMatcher, type DateRange, type PlainDate } from "src/types";
import { formatPlainDate } from "src/utils/plainDate";
import { Temporal } from "temporal-polyfill";

export default {
  component: DateRangePicker,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31699%3A99554",
    },
  },
} as Meta;

export function Default() {
  const [range, setRange] = useState<DateRange | undefined>({ from: jan1, to: jan19 });
  return (
    <div>
      <DateRangePicker
        range={range}
        onSelect={setRange}
        dottedDays={[matchesDay(jan1), matchesDay(jan2), matchesDay(jan29)]}
        disabledDays={[matchesDay(jan10)]}
      />
      <div css={Css.mt1.$}>
        <strong>Selected Range:</strong>
        <span css={Css.ml1.$}>
          {range?.from && formatPlainDate(range.from, "date")} - {range?.to && formatPlainDate(range.to, "date")}
        </span>
      </div>
    </div>
  );
}

export function WithYearControlHeader() {
  const [range, setRange] = useState<DateRange | undefined>({ from: jan1, to: jan19 });
  return (
    <div>
      <DateRangePicker
        useYearPicker
        range={range}
        onSelect={setRange}
        dottedDays={[matchesDay(jan1), matchesDay(jan2), matchesDay(jan29)]}
        disabledDays={[matchesDay(jan10)]}
      />
      <div css={Css.mt1.$}>
        <strong>Selected Range:</strong>
        <span css={Css.ml1.$}>
          {range?.from && formatPlainDate(range.from, "date")} - {range?.to && formatPlainDate(range.to, "date")}
        </span>
      </div>
    </div>
  );
}

function matchesDay(date: PlainDate): DateMatcher {
  return (value) => Temporal.PlainDate.compare(value, date) === 0;
}
