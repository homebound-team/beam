import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { Css } from "src/Css";
import { NumberField, NumberFieldProps } from "src/inputs";

export default {
  title: "Inputs/Number Fields",
  component: NumberField,
} as Meta;

export function NumberFields() {
  return (
    <div css={Css.df.flexColumn.childGap5.$}>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <TestNumberField value={0} />
        <TestNumberField label="Age" value={1000} />
        <TestNumberField label="Age Disabled" value={1000} disabled />
        <TestNumberField label="Age Read Only" value={1000} readOnly />
        <TestNumberField
          label="Age Read Helper Text"
          value={1000}
          helperText="Some really long helper text that we expect to wrap."
        />
        <ValidationNumberField label="Age Validated" value={-1} />
      </div>

      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Compact</h1>
        <TestNumberField compact value={0} />
        <TestNumberField compact label="Age" value={1000} />
        <TestNumberField compact label="Age Disabled" value={1000} disabled />
        <ValidationNumberField label="Age Validated" compact value={-1} />
      </div>

      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Unit Types</h1>
        <TestNumberField label="Percent" type="percent" value={12} />
        <TestNumberField label="Cents" type="cents" value={1000} />
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
  const [internalValue, setValue] = useState<number | undefined>(value);
  const isValid = useMemo(() => internalValue && internalValue > 0, [internalValue]);
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
