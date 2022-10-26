import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { Icon } from "src/components";
import { Css, Only } from "src/Css";
import { TextField, TextFieldProps } from "src/inputs";
import { TextFieldXss } from "src/interfaces";

export default {
  component: TextField,
  title: "Workspace/Inputs/Text Field",
} as Meta;

export function TextFieldStyles() {
  return (
    <div css={Css.df.fdc.gap5.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <TestTextField value="" label="Name" hideLabel />
        <TestTextField value="Brandon" label="Name" inlineLabel />
        <TestTextField label="Name" value="" />
        <TestTextField label="Name" required value="" />
        <TestTextField label="Name Focused" value="Brandon" autoFocus />
        <TestTextField label="Name Disabled" value="Brandon" disabled="Disabled reason tooltip" />
        <TestTextField
          label="Name Helper Text"
          value="Brandon"
          helperText="Some really long helper text that we expect to wrap."
        />
        <TestTextField
          label="Name Helper Paragraph"
          value="Brandon"
          helperText={
            <div>
              sentence one <br /> sentence two
            </div>
          }
        />
        <ValidationTextField value="not a valid email" label="Email" />
        <ValidationTextField
          label="Name"
          value="Brandon"
          helperText="Some really long helper text that we expect to wrap."
        />
        <TestTextField label="Name Clearable" value="Brandon" clearable />
        <ValidationTextField label="Omit Error Message" value="Brandon" clearable hideErrorMessage />
      </div>

      <div css={Css.df.fdc.gap2.$}>
        <h1 css={Css.lg.$}>Compact</h1>
        <TestTextField compact value="" label="Name" hideLabel />
        <TestTextField compact value="Brandon" label="Name" inlineLabel />
        <TestTextField compact label="Name" value="" />
        <TestTextField compact label="Name" value="Brandon" />
        <TestTextField compact label="Name" value="Brandon" disabled />
        <TestTextField
          compact
          label="Name"
          value="Brandon"
          helperText="Some really long helper text that we expect to wrap."
        />
        <ValidationTextField compact value="not a valid email" label="Email" />
        <TestTextField compact label="Name Clearable" value="Brandon" clearable />
        <TestTextField
          compact
          label="Start and End Adornments"
          value="Brandon"
          startAdornment={<Icon icon="search" />}
          endAdornment={<Icon icon="star" />}
        />
      </div>
    </div>
  );
}

export function TextFieldReadOnly() {
  return (
    <div css={Css.df.gap2.$}>
      <div css={Css.df.fdc.gap3.$}>
        <b>Read Only</b>
        <TestTextField label="Name" value="first" readOnly={true} />
        <TestTextField label="Name" value="first - with tooltip" inlineLabel readOnly="Read only reason tooltip" />
        <TestTextField label="Name" value="first" hideLabel readOnly={true} />
        <TestTextField label="Name" value={"first ".repeat(20) + "last"} readOnly={true} />
      </div>
      {/*Matching column but w/o readOnly for comparison*/}
      <div css={Css.df.fdc.gap3.$}>
        <b>Editable</b>
        <TestTextField label="Name" value="first" />
        <TestTextField label="Name" value="first" inlineLabel />
        <TestTextField label="Name" value="first" hideLabel />
        <TestTextField label="Name" value={"first ".repeat(20) + "last"} />
      </div>
    </div>
  );
}

function TestTextField<X extends Only<TextFieldXss, X>>(props: Omit<TextFieldProps<X>, "onChange">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <TextField
      value={internalValue}
      onChange={setValue}
      {...otherProps}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}

function ValidationTextField<X extends Only<TextFieldXss, X>>(props: Omit<TextFieldProps<X>, "onChange">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState<string | undefined>(value);
  // Validates that the input's value is a properly formatted email address.
  const isValid = useMemo(
    () => internalValue && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(internalValue),
    [internalValue],
  );
  return (
    <TextField
      {...otherProps}
      value={internalValue}
      onChange={setValue}
      errorMsg={!isValid ? "The email address entered is invalid. Please provide a valid email address." : undefined}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}
