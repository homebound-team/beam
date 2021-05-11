import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React, { useState } from "react";
import { Button, DateField, DateFieldProps, TextField } from "src/components";
import { samples } from "src/utils/sb";

export default {
  title: "Components/Date Field",
  component: Button,
  args: { onClick: action("onPress") },
} as Meta<any>;

export function DateFields() {
  return samples(
    ["TextField for comparison", <TextField label="First Name" />],
    ["With Label", <TestDateField label="Start Date" />],
    ["Without Label", <TestDateField />],
    ["Disabled", <TestDateField disabled />],
    ["Error Message", <TestDateField errorMsg="Required" />],
  );
}

function TestDateField(props: Omit<DateFieldProps, "value" | "onChange">) {
  const [value, onChange] = useState(new Date());
  return <DateField {...props} {...{ value, onChange }} />;
}
