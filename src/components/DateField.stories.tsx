import { Meta } from "@storybook/react";
import { useState } from "react";
import { Button, DateField, DateFieldProps, TextField } from "src/components";
import { samples } from "src/utils/sb";

export default {
  title: "Inputs / Date Field",
  component: Button,
} as Meta;

export function DateFields() {
  return samples(
    ["TextField for comparison", <TextField label="First Name" value="Foo" onChange={() => {}} />],
    ["With Label", <TestDateField label="Start Date" />],
    ["Without Label", <TestDateField />],
    ["Disabled", <TestDateField disabled />],
    ["Error Message", <TestDateField errorMsg="Required" />],
    ["Helper Text", <TestDateField helperText="Some really long helper text that we expect to wrap." />],
  );
}

function TestDateField(props: Omit<DateFieldProps, "value" | "onChange">) {
  const [value, onChange] = useState(new Date());
  return <DateField {...props} {...{ value, onChange }} />;
}
