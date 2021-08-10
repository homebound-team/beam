import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { Css } from "src/Css";
import { TextAreaField, TextAreaFieldProps, TextField } from "src/inputs";

export default {
  component: TextAreaField,
  title: "Inputs/Text Area",
} as Meta;

export function TextAreaStyles() {
  return (
    <div css={Css.df.flexColumn.childGap5.$}>
      <div css={Css.df.flexColumn.childGap2.$}>
        <h1 css={Css.lg.$}>Regular</h1>
        <TestTextArea value="" label="Description" hideLabel />
        <TestTextArea label="Description" value="" />
        <TestTextArea label="Description" value="An example description text." autoFocus />
        <TestTextArea label="Description" value="This is a description that can no longer be edited." disabled />
        <TestTextArea
          label="Description"
          value="See helper text."
          helperText="Some really long helper text that we expect to wrap."
        />
        <ValidationTextArea value="Not enough characters" />
        <TextField label="Regular Field For Reference" value="value" onChange={() => {}} />
      </div>
    </div>
  );
}

export function TextAreaReadOnly() {
  return (
    <div css={Css.df.childGap2.$}>
      <div css={Css.df.flexColumn.childGap3.$}>
        <b>Read Only</b>
        <TestTextArea label="Name" value="first" readOnly={true} />
        <TestTextArea label="Name" value="first" hideLabel readOnly={true} />
        <TestTextArea label="Name" value={("first ".repeat(40) + "last.\n\n").repeat(4)} readOnly={true} />
        <TestTextArea label="Name" value={"this is a sentence\n".repeat(4)} readOnly={true} />
      </div>
      {/*Matching column but w/o readOnly for comparison*/}
      <div css={Css.df.flexColumn.childGap3.wPx(400).$}>
        <b>Editable</b>
        <TestTextArea label="Name" value="first" />
        <TestTextArea label="Name" value="first" hideLabel />
        <TestTextArea label="Name" value={("first ".repeat(40) + "last.\n\n").repeat(4)} />
        <TestTextArea label="Name" value={"this is a sentence\n".repeat(4)} />
      </div>
    </div>
  );
}

function TestTextArea(props: Omit<TextAreaFieldProps, "onChange">) {
  const { value, ...others } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <TextAreaField
      value={internalValue}
      onChange={(val) => setValue(val)}
      {...others}
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}

function ValidationTextArea({ value }: { value: string }) {
  const [internalValue, setValue] = useState<string | undefined>(value);
  const isValid = useMemo(() => internalValue && internalValue.length >= 50, [internalValue]);

  return (
    <TextAreaField
      label="Description"
      value={internalValue}
      onChange={(val) => setValue(val)}
      errorMsg={
        !isValid ? "Please enter at least 50 characters. We should probably provide a character counter." : undefined
      }
      onBlur={action("onBlur")}
      onFocus={action("onFocus")}
    />
  );
}
