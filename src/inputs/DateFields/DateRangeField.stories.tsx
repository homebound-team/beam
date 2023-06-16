import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { Css } from "src/Css";
import { jan19, jan2 } from "src/forms/formStateDomain";
import { DateRangeField } from "src/inputs/DateFields/DateRangeField";
import { DateRange } from "src/types";

export default {
  component: DateRangeField,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31699%3A99554",
    },
  },
} as Meta;

export function Example() {
  const [range, setRange] = useState<DateRange | undefined>({ from: jan2, to: jan19 });
  const [rangeInitUndefined, setRange2] = useState<DateRange | undefined>();
  const commonProps = {
    value: range,
    onChange: setRange,
    placeholder: "Date Range",
    onBlur: action("Blur"),
    onFocus: action("Focus"),
  };
  return (
    <div css={Css.df.fdc.gap4.$}>
      <DateRangeField {...commonProps} label="Select a range" />
      <DateRangeField {...commonProps} label="'Medium' format'" format="medium" />
      <DateRangeField {...commonProps} label="Compact" compact />
      <DateRangeField {...commonProps} label="Read Only" readOnly="Read Only reason" />
      <DateRangeField {...commonProps} label="Disabled" disabled="Disabled reason" />
      <DateRangeField
        {...commonProps}
        value={rangeInitUndefined}
        onChange={setRange2}
        label="Error message"
        errorMsg={rangeInitUndefined ? undefined : "Required"}
      />
    </div>
  );
}
