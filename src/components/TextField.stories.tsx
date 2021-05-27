import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { TextField, TextFieldProps } from "src/components/TextField";
import { Css } from "src/Css";

export default {
  component: TextField,
  title: "Inputs / Text Fields",
} as Meta;

export function TextFields() {
  return (
    <div css={Css.df.justifyAround.childGap(4).$}>
      <div>
        <h1 css={Css.lg.mb2.$}>Regular</h1>
        <TestTextField value="" />
        <br />
        <TestTextField label="Name" value="" />
        <br />
        <TestTextField label="Name Focused" value="Brandon" autoFocus />
        <br />
        <TestTextField label="Name Disabled" value="Brandon" disabled />
        <br />
        <TestTextField
          label="Name Helper Text"
          value="Brandon"
          helperText="Some really long helper text that we expect to wrap."
        />
        <br />
        <TestTextField
          label="Name Helper Paragraph"
          value="Brandon"
          helperText={
            <div>
              sentence one <br /> sentence two
            </div>
          }
        />
        <br />
        <ValidationTextField value="not a valid email" />
        <br />
        <ValidationTextField
          label="Name"
          value="Brandon"
          helperText="Some really long helper text that we expect to wrap."
        />
      </div>
      <div>
        <h1 css={Css.lg.mb2.$}>Compact</h1>
        <TestTextField compact value="" />
        <br />
        <TestTextField compact label="Name" value="" />
        <br />
        <TestTextField compact label="Name" value="Brandon" />
        <br />
        <TestTextField compact label="Name" value="Brandon" disabled />
        <br />
        <TestTextField
          compact
          label="Name"
          value="Brandon"
          helperText="Some really long helper text that we expect to wrap."
        />
        <br />
        <ValidationTextField compact value="not a valid email" />
      </div>
    </div>
  );
}

function TestTextField(props: Omit<TextFieldProps, "onChange">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return <TextField value={internalValue} onChange={setValue} {...otherProps} />;
}

function ValidationTextField(props: Omit<TextFieldProps, "onChange">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState<string | undefined>(value);
  const isValid = useMemo(() => internalValue && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(internalValue), [
    internalValue,
  ]);
  return (
    <TextField
      label="Email"
      {...otherProps}
      value={internalValue}
      onChange={setValue}
      errorMsg={!isValid ? "The email address entered is invalid. Please provide a valid email address." : undefined}
    />
  );
}
