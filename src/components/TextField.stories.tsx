import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { TextField, TextFieldProps } from "src/components/TextField";
import { Css } from "src/Css";

export default {
  component: TextField,
  title: "Components/Text Fields",
} as Meta;

export function TextFields() {
  return (
    <div css={Css.df.justifyAround.$}>
      <div>
        <h1 css={Css.lg.mb2.$}>Regular</h1>
        <TestTextField />
        <br />
        <TestTextField label="Name" />
        <br />
        <TestTextField label="Name" value="Brandon" autoFocus />
        <br />
        <TestTextField label="Name" value="Brandon" disabled />
        <br />
        <ValidationTextField value="not a valid email" />
      </div>
      <div>
        <h1 css={Css.lg.mb2.$}>Compact</h1>
        <TestTextField compact />
        <br />
        <TestTextField compact label="Name" />
        <br />
        <TestTextField compact label="Name" value="Brandon" />
        <br />
        <TestTextField compact label="Name" value="Brandon" disabled />
        <br />
        <ValidationTextField compact value="not a valid email" />
      </div>
    </div>
  );
}

function TestTextField(props: TextFieldProps) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return <TextField value={internalValue} onChange={setValue} {...otherProps} />;
}

function ValidationTextField({ compact, value }: { compact?: boolean; value: string }) {
  const [internalValue, setValue] = useState(value);
  const isValid = useMemo(() => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(internalValue), [internalValue]);
  return (
    <TextField
      compact={compact}
      label="Email"
      value={internalValue}
      onChange={setValue}
      errorMsg={!isValid ? "The email address entered is invalid. Please provide a valid email address." : undefined}
    />
  );
}
