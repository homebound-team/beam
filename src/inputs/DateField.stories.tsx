import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Button } from "src/components";
import { jan1 } from "src/forms/formStateDomain";
import { DateField, DateFieldProps, TextField } from "src/inputs";
import { samples } from "src/utils/sb";

export default {
  title: "Inputs/Date Field",
  component: Button,
} as Meta;

export function DateFields() {
  return samples(
    ["TextField for comparison", <TextField label="First Name" value="Foo" onChange={() => {}} />],
    ["With Label", <TestDateField label="Projected Client Presentation Date" />],
    ["Without Label", <TestDateField />],
    ["Disabled", <TestDateField disabled />],
    ["Error Message", <TestDateField errorMsg="Required" />],
    ["Helper Text", <TestDateField helperText="Some really long helper text that we expect to wrap." />],
  );
}

function TestDateField(props: Omit<DateFieldProps, "value" | "onChange" | "onBlur" | "onFocus">) {
  const [value, onChange] = useState(jan1);
  return <DateField {...props} {...{ value, onChange }} onBlur={action("onBlur")} onFocus={action("onFocus")} />;
}
