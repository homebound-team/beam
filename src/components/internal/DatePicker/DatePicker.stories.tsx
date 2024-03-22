import { Meta } from "@storybook/react";
import { useState } from "react";
import { DatePicker } from "src/components/internal/DatePicker";
import { jan1, jan10, jan2, jan29 } from "src/forms/formStateDomain";
import { Css } from "src";
import { format } from "date-fns";

export default {
  component: DatePicker,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31586%3A99884",
    },
  },
} as Meta;

export function Default() {
  const [date, setDate] = useState(jan1);
  return (
    <div>
      <DatePicker value={date} onSelect={setDate} dottedDays={[jan1, jan2, jan29]} disabledDays={[jan10]} />
      <div css={Css.mt1.$}>
        <strong>Selected Date:</strong>
        <span css={Css.ml1.$}>{date && format(new Date(date), "MM/dd/yyyy")}</span>
      </div>
    </div>
  );
}

export function WithYearControlHeader() {
  const [date, setDate] = useState(jan1);
  return (
    <div>
      <DatePicker
        useYearPicker
        value={date}
        onSelect={setDate}
        dottedDays={[jan1, jan2, jan29]}
        disabledDays={[jan10]}
      />
      <div css={Css.mt1.$}>
        <strong>Selected Date:</strong>
        <span css={Css.ml1.$}>{date && format(new Date(date), "MM/dd/yyyy")}</span>
      </div>
    </div>
  );
}
