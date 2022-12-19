import { Meta } from "@storybook/react";
import { format } from "date-fns";
import { useState } from "react";
import { DateRangePicker } from "src/components/internal/DatePicker";
import { Css } from "src/Css";
import { jan1, jan10, jan19, jan2, jan29 } from "src/forms/formStateDomain";
import { DateRange } from "src/types";

export default {
  component: DateRangePicker,
  title: "Workspace/Components/DateRangePicker",
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
      <DateRangePicker range={range} onSelect={setRange} dottedDays={[jan1, jan2, jan29]} disabledDays={[jan10]} />
      <div css={Css.mt1.$}>
        <strong>Selected Range:</strong>
        <span css={Css.ml1.$}>
          {range?.from && format(new Date(range?.from), "MM/dd/yyyy")} -{" "}
          {range?.to && format(new Date(range?.to), "MM/dd/yyyy")}
        </span>
      </div>
    </div>
  );
}
