import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { TextAreaField, TextAreaProps } from "src/components/TextAreaField";
import { Css } from "src/Css";

export default {
  component: TextAreaField,
  title: "Components/Text Areas",
} as Meta;

export function TextAreas() {
  return (
    <div css={Css.df.justifyAround.$}>
      <div>
        <StatefulTextArea />
        <br />
        <StatefulTextArea label="Description" />
        <br />
        <StatefulTextArea label="Description" value="An example description text." autoFocus />
        <br />
        <StatefulTextArea label="Description" value="This is a description that can no longer be edited." disabled />
        <br />
        <ValidationTextArea value="Not enough characters" />
      </div>
      <div>
        <StatefulTextArea wide />
        <br />
        <StatefulTextArea wide label="Description" />
        <br />
        <StatefulTextArea wide label="Description" value="An example description text." />
        <br />
        <StatefulTextArea
          wide
          label="Description"
          value="This is a description that can no longer be edited."
          disabled
        />
        <br />
        <ValidationTextArea wide value="Not enough characters" />
      </div>
    </div>
  );
}

function StatefulTextArea(props: TextAreaProps) {
  const { value, disabled, wide, label } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <TextAreaField
      wide={wide}
      label={label}
      disabled={disabled}
      value={internalValue}
      onChange={(val) => setValue(val)}
    />
  );
}

function ValidationTextArea({ wide, value }: { wide?: boolean; value: string }) {
  const [internalValue, setValue] = useState(value);
  const isValid = useMemo(() => internalValue.length >= 50, [internalValue]);

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
