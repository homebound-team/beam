import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React, { useState } from "react";
import { Button } from "src";
import { DatePicker, DatePickerProps } from "src/components/DatePicker";
import { TextField } from "src/components/TextField";
import { samples } from "src/utils/sb";

export default {
  title: "Components/DatePicker",
  component: Button,
  args: { onClick: action("onPress") },
} as Meta<any>;

export function DatePickers() {
  return samples(
    ["TextField for comparison", <TextField label="First Name" />],
    ["With Label", <TestDatePicker label="Start Date" />],
    ["Without Label", <TestDatePicker />],
    ["Disabled", <TestDatePicker disabled />],
    ["Error Message", <TestDatePicker errorMsg="Required" />],
  );
}

function TestDatePicker(props: Omit<DatePickerProps, "value" | "onChange">) {
  const [value, onChange] = useState(new Date());
  return <DatePicker {...props} {...{ value, onChange }} />;
}
