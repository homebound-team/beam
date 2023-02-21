import { Meta } from "@storybook/react";
import { useState } from "react";
import { DatePicker } from "src/components/internal/DatePicker";
import { jan1, jan10, jan2, jan29 } from "src/forms/formStateDomain";

export default {
  component: DatePicker,
  title: "Workspace/Components/DatePicker",
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31586%3A99884",
    },
  },
} as Meta;

export function Default() {
  const [date, setDate] = useState(jan1);
  return <DatePicker value={date} onSelect={setDate} dottedDays={[jan1, jan2, jan29]} disabledDays={[jan10]} />;
}

export function Skip() {
  const [date, setDate] = useState(jan1);
  return (
    <DatePicker
      value={date}
      onSelect={setDate}
      dottedDays={[jan1, jan2, jan29]}
      disabledDays={[jan10]}
      yearPicker={"skip"}
    />
  );
}

export function Precise() {
  const [date, setDate] = useState(jan1);
  return (
    <DatePicker
      value={date}
      onSelect={setDate}
      dottedDays={[jan1, jan2, jan29]}
      disabledDays={[jan10]}
      yearPicker={"precise"}
    />
  );
}
