import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { TextAreaField, TextAreaFieldProps } from "src/components/TextAreaField";
import { Css } from "src/Css";

export default {
  component: TextAreaField,
  title: "Components/Text Areas",
} as Meta;

export function TextAreas() {
  return (
    <div css={Css.df.justifyAround.$}>
      <div>
        <h1 css={Css.lg.mb2.$}>Regular</h1>
        <TestTextArea value="" />
        <br />
        <TestTextArea label="Description" value="" />
        <br />
        <TestTextArea label="Description" value="An example description text." autoFocus />
        <br />
        <TestTextArea label="Description" value="This is a description that can no longer be edited." disabled />
        <br />
        <TestTextArea
          label="Description"
          value="See helper text."
          helperText="Some really long helper text that we expect to wrap."
        />
        <br />
        <ValidationTextArea value="Not enough characters" />
      </div>
      <div>
        <h1 css={Css.lg.mb2.$}>Wide</h1>
        <TestTextArea wide value="" />
        <br />
        <TestTextArea wide label="Description" value="" />
        <br />
        <TestTextArea wide label="Description" value="An example description text." />
        <br />
        <TestTextArea wide label="Description" value="This is a description that can no longer be edited." disabled />
        <br />
        <ValidationTextArea wide value="Not enough characters" />
      </div>
    </div>
  );
}

function TestTextArea(props: Omit<TextAreaFieldProps, "onChange">) {
  const { value, ...others } = props;
  const [internalValue, setValue] = useState(value);
  return <TextAreaField value={internalValue} onChange={(val) => setValue(val)} {...others} />;
}

function ValidationTextArea({ wide, value }: { wide?: boolean; value: string }) {
  const [internalValue, setValue] = useState<string | undefined>(value);
  const isValid = useMemo(() => internalValue && internalValue.length >= 50, [internalValue]);

  return (
    <TextAreaField
      wide={wide}
      label="Description"
      value={internalValue}
      onChange={(val) => setValue(val)}
      errorMsg={
        !isValid ? "Please enter at least 50 characters. We should probably provide a character counter." : undefined
      }
    />
  );
}
