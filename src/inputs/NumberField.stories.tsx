import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { Css } from "src/Css";
import { TextField } from "src/inputs";
import { NumberField, NumberFieldProps } from "./NumberField";

export default {
  title: "Inputs/Number Field",
  component: NumberField,
} as Meta;

export function NumberFieldStyles() {
  return (
    <div css={Css.df.fdc.childGap5.$}>
      <div css={Css.df.fdc.childGap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <TestNumberField value={0} label="Age" hideLabel />
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

      <div css={Css.df.fdc.childGap2.$}>
        <h1 css={Css.lg.$}>Compact</h1>
        <TestNumberField compact value={0} label="Age" hideLabel />
        <TestNumberField compact label="Age" value={1000} />
        <TestNumberField compact label="Age Disabled" value={1000} disabled />
        <ValidationNumberField label="Age Validated" compact value={-1} />
      </div>

      <div css={Css.df.fdc.childGap2.$}>
        <h1 css={Css.lg.$}>Unit Types</h1>
        <TestNumberField label="Percent" type="percent" value={12} />
        <TestNumberField label="Cents" type="cents" value={1000} />
        <TestNumberField label="Margin" type="basisPoints" value={1275} />
      </div>
    </div>
  );
}

export function NumberFieldReadOnly() {
  return (
    <div css={Css.df.childGap2.$}>
      <div css={Css.df.fdc.childGap3.$}>
        <b>Read Only</b>
        <TextField label="First Name" value="first" onChange={() => {}} readOnly={true} />
        <TestNumberField label="Name" value={100} readOnly={true} />
        <TestNumberField label="Name" value={100} hideLabel readOnly={true} />
        <TestNumberField label="Name" value={100} readOnly={true} type="cents" />
        <TestNumberField label="Name" value={100} readOnly={true} type="percent" />
      </div>
      {/*Matching column but w/o readOnly for comparison*/}
      <div css={Css.df.fdc.childGap3.$}>
        <b>Editable</b>
        <TextField label="First Name" value="first" onChange={() => {}} />
        <TestNumberField label="Name" value={100} />
        <TestNumberField label="Name" value={100} hideLabel />
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
