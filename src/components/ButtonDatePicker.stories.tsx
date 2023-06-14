import { Meta } from "@storybook/react";
import { useState } from "react";
import { ButtonDatePicker } from "src";
import { Css } from "src/Css";
import { jan1 } from "src/forms/formStateDomain";
import { withDimensions } from "src/utils/sb";

export default {
  component: ButtonDatePicker,
  decorators: [withDimensions()],
} as Meta;

export function MenuOpen() {
  const [date, setDate] = useState(jan1);

  return (
    <div>
      <h2 css={Css.lg.$}>Date Picker</h2>
      <div>
        <ButtonDatePicker trigger={{ label: "Select Date" }} value={date} onSelect={setDate} defaultOpen />
      </div>
    </div>
  );
}

export function InteractiveMenu() {
  const [date, setDate] = useState(jan1);
  return <ButtonDatePicker trigger={{ label: "Select Date" }} value={date} onSelect={setDate} />;
}
