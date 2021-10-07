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
    ["Disabled", <TestDateField label="Start Date" disabled />],
    ["Inline Label", <TestDateField label="Start Date" inlineLabel />],
    ["Read Only", <TestDateField label="Start Date" readOnly />],
    ["Read Only Long", <TestDateField label="Start Date" readOnly long />],
    ["Error Message", <TestDateField label="Start Date" errorMsg="Required" />],
    [
      "Helper Text",
      <TestDateField label="Start Date" helperText="Some really long helper text that we expect to wrap." />,
    ],
  );
}

function TestDateField(props: Omit<DateFieldProps, "value" | "onChange" | "onBlur" | "onFocus">) {
  const [value, onChange] = useState(jan1);
  return <DateField {...props} {...{ value, onChange }} onBlur={action("onBlur")} onFocus={action("onFocus")} />;
}
