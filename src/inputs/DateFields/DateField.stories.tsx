import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Button } from "src/components";
import { Css } from "src/Css";
import { jan1, jan10, jan2 } from "src/forms/formStateDomain";
import { DateField, DateFieldProps, TextField } from "src/inputs/index";
import { noop } from "src/utils";
import { samples, withDimensions } from "src/utils/sb";

export default {
  component: Button,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31699%3A99566",
    },
  },
} as Meta;

export function DateFields() {
  return samples(
    ["TextField for comparison", <TextField label="First Name" value="Foo" onChange={() => {}} />],
    ["With Label", <TestDateField label="Projected Client Presentation Date" />],
    ["Without calendar icon", <TestDateField label="Projected Client Presentation Date" hideCalendarIcon />],
    ["Disabled", <TestDateField label="Start Date" disabled="Disabled Reason" />],
    ["Inline Label", <TestDateField label="Start Date" labelStyle="inline" />],
    ["Read Only", <TestDateField label="Start Date" readOnly="Read only reason tooltip" />],
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
    [
      "Disabled Days",
      <TestDateField compact label="End Date" iconLeft format="medium" disabledDays={{ after: jan2 }} />,
    ],
    [
      "Disabled Days - before Jan 1 and after Jan 10",
      <TestDateField
        compact
        label="End Date"
        iconLeft
        format="medium"
        // passing in Modifier array
        disabledDays={[{ before: jan1 }, { after: jan10 }]}
      />,
    ],
    ["Full Width", <TestDateField label="Date" fullWidth />],
  );
}

export function DatePickerOpen() {
  return (
    <>
      <h2 css={Css.lg.mb2.$}>DateField with disabled days</h2>
      <TestDateField
        compact
        label="End Date"
        iconLeft
        format="medium"
        disabledDays={[{ before: jan1 }, { after: jan10 }]}
        defaultOpen
      />
    </>
  );
}
DatePickerOpen.decorators = [withDimensions()];

function TestDateField(props: Omit<DateFieldProps, "value" | "onChange" | "onBlur" | "onFocus">) {
  const [value, onChange] = useState<Date | undefined>(jan1);
  return <DateField {...props} {...{ value, onChange }} onBlur={action("onBlur")} onFocus={action("onFocus")} />;
}
