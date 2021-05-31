import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { Css } from "src/Css";
import { NumberField as NumberFieldComponent, NumberFieldProps } from "src/inputs";

export default {
  title: "Inputs/Number Fields",
  component: NumberFieldComponent,
} as Meta;

export function NumberFields() {
  return (
    <div css={Css.df.justifyAround.childGap(4).$}>
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
        <TestNumberField
          label="Age Read Helper Text"
          value={1000}
          helperText="Some really long helper text that we expect to wrap."
        />
        <br />
        <ValidationNumberField label="Age Validated" value={-1} />
      </div>
      <div>
        <h1 css={Css.lg.mb2.$}>Compact</h1>
        <TestNumberField compact value={0} />
        <br />
        <TestNumberField compact label="Age" value={1000} />
        <br />
        <TestNumberField compact label="Age Disabled" value={1000} disabled />
        <br />
        <ValidationNumberField label="Age Validated" compact value={-1} />
      </div>
      <div>
        <h1 css={Css.lg.mb2.$}>Unit Types</h1>
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
  return <NumberFieldComponent value={internalValue} onChange={setValue} {...otherProps} />;
}

function ValidationNumberField({ label, compact, value }: { label: string; compact?: boolean; value: number }) {
  const [internalValue, setValue] = useState<number | undefined>(value);
  const isValid = useMemo(() => internalValue && internalValue > 0, [internalValue]);
  return (
    <NumberFieldComponent
      label={label}
      compact={compact}
      value={internalValue}
      onChange={setValue}
      errorMsg={!isValid ? "Cannot be negative" : undefined}
    />
  );
}
