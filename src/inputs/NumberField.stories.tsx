import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { Css } from "src/Css";
import { TextField } from "src/inputs";
import { NumberField, NumberFieldProps } from "src/inputs/NumberField";

export default {
  component: NumberField,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=1291%3A0",
    },
  },
} as Meta;

export function NumberFieldStyles() {
  return (
    <div css={Css.df.fdc.gap5.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <TestNumberField value={0} label="Age" labelStyle="hidden" />
        <TestNumberField label="Age" value={1000} />
        <TestNumberField label="Age Positive Only" value={1000} positiveOnly />
        <TestNumberField label="Age Disabled" value={1000} disabled="Disabled reason tooltip" />
        <TestNumberField label="Age Read Only" value={1000} readOnly="Read only reason tooltip" />
        <TestNumberField
          label="Age Read Helper Text"
          value={1000}
          helperText="Some really long helper text that we expect to wrap."
        />
        <ValidationNumberField label="Age Validated" value={-1} />
        <ValidationNumberField label="Omit Error Message" value={-1} hideErrorMessage />
      </div>

      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Compact</h1>
        <TestNumberField compact value={0} label="Age" labelStyle="hidden" />
        <TestNumberField compact label="Age" value={1000} />
        <TestNumberField compact label="Age Disabled" value={1000} disabled />
        <ValidationNumberField label="Age Validated" compact value={-1} />
      </div>

      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Unit Types</h1>
        <TestNumberField label="Percent" type="percent" value={12.55} numFractionDigits={2} truncate />
        <TestNumberField label="Mills" type="mills" value={1000} />
        <TestNumberField label="Cents" type="cents" value={1000} />
        <TestNumberField label="Dollars" type="dollars" value={1000} />
        <TestNumberField label="Margin" type="basisPoints" value={1275} />
        <TestNumberField label="Days" type="days" value={1} />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Custom Format Options</h1>
        <TestNumberField label="kph" value={50} numberFormatOptions={{ style: "unit", unit: "kilometer-per-hour" }} />
        <TestNumberField label="Euro" value={500} numberFormatOptions={{ style: "currency", currency: "EUR" }} />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Force 3 Integers</h1>
        <TestNumberField value={undefined} numIntegerDigits={3} label="Code" labelStyle="hidden" placeholder="Code.." />
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Without grouping</h1>
        <TestNumberField value={123456789} label="No grouping" useGrouping={false} />
      </div>

      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Full Width</h1>
        <TestNumberField value={0} label="Age" fullWidth />
      </div>
    </div>
  );
}

export function NumberFieldReadOnly() {
  return (
    <div css={Css.df.gap2.$}>
      <div css={Css.df.fdc.gap3.$}>
        <b>Read Only</b>
        <TextField label="First Name" value="first" onChange={() => {}} readOnly={true} />
        <TestNumberField label="Name" value={100} readOnly={true} />
        <TestNumberField label="Name" value={100} labelStyle="hidden" readOnly={true} />
        <TestNumberField label="Name" value={100} readOnly={true} type="mills" />
        <TestNumberField label="Name" value={100} readOnly={true} type="cents" />
        <TestNumberField label="Name" value={100} readOnly={true} type="percent" />
      </div>
      {/* Matching column but w/o readOnly for comparison */}
      <div css={Css.df.fdc.gap3.$}>
        <b>Editable</b>
        <TextField label="First Name" value="first" onChange={() => {}} />
        <TestNumberField label="Name" value={100} />
        <TestNumberField label="Name" value={100} labelStyle="hidden" />
        <TestNumberField label="Name" value={100} type="cents" />
        <TestNumberField label="Name" value={100} type="percent" />
      </div>
    </div>
  );
}

function TestNumberField(props: Omit<NumberFieldProps, "onChange" | "onBlur" | "onFocus">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <NumberField
      value={internalValue}
      onChange={setValue}
      {...otherProps}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}

function ValidationNumberField({
  label,
  compact,
  value,
  hideErrorMessage,
}: {
  label: string;
  compact?: boolean;
  value: number;
  hideErrorMessage?: boolean;
}) {
  const [internalValue, setValue] = useState<number | undefined>(value);
  const isValid = useMemo(() => internalValue && internalValue > 0, [internalValue]);
  return (
    <NumberField
      label={label}
      compact={compact}
      value={internalValue}
      onChange={setValue}
      errorMsg={!isValid ? "Cannot be negative" : undefined}
      hideErrorMessage={hideErrorMessage}
    />
  );
}
