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
        <StatefulTextArea label="Description" defaultValue="An example description text." autoFocus />
        <br />
        <StatefulTextArea
          label="Description"
          defaultValue="This is a description that can no longer be edited."
          disabled
        />
        <br />
        <ValidationTextArea value="Not enough characters" />
      </div>
      <div>
        <StatefulTextArea />
        <br />
        <StatefulTextArea wide label="Description" />
        <br />
        <StatefulTextArea wide label="Description" defaultValue="An example description text." />
        <br />
        <StatefulTextArea
          wide
          label="Description"
          defaultValue="This is a description that can no longer be edited."
          disabled
        />
        <br />
        <ValidationTextArea wide value="Not enough characters" />
      </div>
    </div>
  );
}

function StatefulTextArea(props: TextAreaProps) {
  const [value, setValue] = useState(props.defaultValue);
  return <TextAreaField wide={props.wide} label={props.label} value={value} onChange={(val) => setValue(val)} />;
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
