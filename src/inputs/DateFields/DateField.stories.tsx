import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "src/components";
import { Css } from "src/Css";
import { jan1, jan10, jan2 } from "src/forms/formStateDomain";
import { DateField, DateFieldProps, TextField } from "src/inputs/index";
import { type DateMatcher, type PlainDate } from "src/types";
import { noop } from "src/utils";
import { samples, withDimensions } from "src/utils/sb";
import { action } from "storybook/actions";
import { Temporal } from "temporal-polyfill";

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
    ["TextField for comparison", <TextField key="textField" label="First Name" value="Foo" onChange={() => {}} />],
    ["With Label", <TestDateField key="withLabel" label="Projected Client Presentation Date" />],
    [
      "Without calendar icon",
      <TestDateField key="withoutCalendarIcon" label="Projected Client Presentation Date" hideCalendarIcon />,
    ],
    ["Disabled", <TestDateField key="disabled" label="Start Date" disabled="Disabled Reason" />],
    ["Inline Label", <TestDateField key="inlineLabel" label="Start Date" labelStyle="inline" />],
    ["Read Only", <TestDateField key="readOnly" label="Start Date" readOnly="Read only reason tooltip" />],
    ["Read Only Long", <TestDateField key="readOnlyLong" label="Start Date" readOnly format="long" />],
    ["Error Message", <TestDateField key="errorMessage" label="Start Date" errorMsg="Required" />],
    [
      "Helper Text",
      <TestDateField
        key="helperText"
        label="Start Date"
        helperText="Some really long helper text that we expect to wrap."
      />,
    ],
    [
      "Placeholder",
      <DateField
        key="placeholder"
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
        placeholder="Select a date"
        label="Date"
        onChange={noop}
        value={undefined}
      />,
    ],
    ["Compact", <TestDateField key="compact" compact label="Start Date" />],
    ["SchedulesV2", <TestDateField key="schedulesV2" compact label="Start Date" iconLeft format="medium" />],
    [
      "Disabled Days",
      <TestDateField
        key="disabledDays"
        compact
        label="End Date"
        iconLeft
        format="medium"
        disabledDays={isAfter(jan2)}
      />,
    ],
    [
      "Disabled Days - before Jan 1 and after Jan 10",
      <TestDateField
        key="disabledDaysRange"
        compact
        label="End Date"
        iconLeft
        format="medium"
        disabledDays={[isBefore(jan1), isAfter(jan10)]}
      />,
    ],
    ["Full Width", <TestDateField key="fullWidth" label="Date" fullWidth />],
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
        disabledDays={[isBefore(jan1), isAfter(jan10)]}
        defaultOpen
      />
    </>
  );
}
DatePickerOpen.decorators = [withDimensions()];

function TestDateField(props: Omit<DateFieldProps, "value" | "onChange" | "onBlur" | "onFocus">) {
  const [value, onChange] = useState<PlainDate | undefined>(jan1);
  return <DateField {...props} {...{ value, onChange }} onBlur={action("onBlur")} onFocus={action("onFocus")} />;
}

function isAfter(date: PlainDate): DateMatcher {
  return (value) => Temporal.PlainDate.compare(value, date) > 0;
}

function isBefore(date: PlainDate): DateMatcher {
  return (value) => Temporal.PlainDate.compare(value, date) < 0;
}
