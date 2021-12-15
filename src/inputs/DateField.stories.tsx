import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Button } from "src/components";
import { jan1, jan2 } from "src/forms/formStateDomain";
import { DateField, DateFieldProps, TextField } from "src/inputs";
import { noop } from "src/utils";
import { samples } from "src/utils/sb";

export default {
  title: "Inputs/Date Field",
  component: Button,
} as Meta;

export function DateFields() {
  return samples(
    ["TextField for comparison", <TextField label="First Name" value="Foo" onChange={() => {}} />],
    ["With Label", <TestDateField label="Projected Client Presentation Date" />],
    ["Disabled", <TestDateField label="Start Date" disabled="Disabled Reason" />],
    ["Inline Label", <TestDateField label="Start Date" inlineLabel />],
    ["Read Only", <TestDateField label="Start Date" readOnly />],
    ["Read Only Long", <TestDateField label="Start Date" readOnly format="long" />],
    ["Error Message", <TestDateField label="Start Date" errorMsg="Required" />],
    [
      "Helper Text",
      <TestDateField label="Start Date" helperText="Some really long helper text that we expect to wrap." />,
    ],
    [
      "Placeholder",
      <DateField
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
        placeholder="Select a date"
        label="Date"
        onChange={noop}
        value={undefined}
      />,
    ],
    ["Compact", <TestDateField compact label="Start Date" />],
    ["SchedulesV2", <TestDateField compact label="Start Date" iconLeft format="medium" />],
    ["Disabled Days", <TestDateField compact label="End Date" iconLeft format="medium" disabledDays={{ after: jan2 }}/>],
  );
}

function TestDateField(props: Omit<DateFieldProps, "value" | "onChange" | "onBlur" | "onFocus">) {
  const [value, onChange] = useState(jan1);
  return <DateField {...props} {...{ value, onChange }} onBlur={action("onBlur")} onFocus={action("onFocus")} />;
}
