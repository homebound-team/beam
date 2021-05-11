import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { NumberField, NumberFieldProps } from "src/components/NumberField";
import { Css } from "src/Css";

export default {
  component: NumberField,
  title: "Components/Number Fields",
} as Meta;

export function TextFields() {
  return (
    <div css={Css.df.justifyAround.$}>
      <div>
        <h1 css={Css.lg.mb2.$}>Regular</h1>
        <TestNumberField value={0} />
        <br />
        <TestNumberField label="Age" value={1000} />
        <br />
        <TestNumberField label="Age Disabled" value={1000} disabled />
        <br />
        <TestNumberField label="Age Read Only" value={1000} readOnly />
        <br />
        <ValidationNumberField label="Age Validated" value={-1} />
      </div>
      <div>
        <h1 css={Css.lg.mb2.$}>Compact</h1>
        <TestNumberField compact value={0} />
        <br />
        <TestNumberField compact label="Age" value={1000} />
        <br />
        <TestNumberField compact label="Age" value={1000} />
        <br />
        <TestNumberField compact label="Age Disabled" value={1000} disabled />
        <br />
        <ValidationNumberField label="Age Validated" compact value={-1} />
      </div>
      <div>
        <h1 css={Css.lg.mb2.$}>Styles</h1>
        <TestNumberField label="Percent" type="percent" value={12} />
        <br />
        <TestNumberField label="Cents" type="cents" value={1000} />
        <br />
        <TestNumberField label="Margin" type="basisPoints" value={1275} />
      </div>
    </div>
  );
}

function TestNumberField(props: Omit<NumberFieldProps, "onChange">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return <NumberField value={internalValue} onChange={setValue} {...otherProps} />;
}

function ValidationNumberField({ label, compact, value }: { label: string; compact?: boolean; value: number }) {
  const [internalValue, setValue] = useState(value);
  const isValid = useMemo(() => internalValue > 0, [internalValue]);
  return (
    <NumberField
      label={label}
      compact={compact}
      value={internalValue}
      onChange={setValue}
      errorMsg={!isValid ? "Cannot be negative" : undefined}
    />
  );
}
