import { Meta } from "@storybook/react";
import { useState } from "react";
import { DatePicker } from "src/components/internal/DatePicker";
import { jan1 } from "src/forms/formStateDomain";

export default {
  component: DatePicker,
  title: "Components/DatePicker",
} as Meta;

export function Default() {
  const [date, setDate] = useState(jan1);
  return <DatePicker value={date} onSelect={setDate} />;
}
