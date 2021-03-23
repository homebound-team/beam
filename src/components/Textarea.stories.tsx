import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { Textarea } from "src/components/Textarea";
import { Css } from "src/Css";

export default {
  component: Textarea,
  title: "Components/Textareas",
} as Meta;

export function Textareas() {
  return (
    <div css={Css.df.justifyAround.$}>
      <div>
        <Textarea />
        <br />
        <Textarea label="Description" />
        <br />
        <Textarea label="Description" defaultValue="An example description text." autoFocus />
        <br />
        <Textarea label="Description" defaultValue="This is a description that can no longer be edited." disabled />
        <br />
        <ValidationTextarea value="Not enough characters" />
      </div>
      <div>
        <Textarea />
        <br />
        <Textarea wide label="Description" />
        <br />
        <Textarea wide label="Description" defaultValue="An example description text." />
        <br />
        <Textarea
          wide
          label="Description"
          defaultValue="This is a description that can no longer be edited."
          disabled
        />
        <br />
        <ValidationTextarea wide value="Not enough characters" />
      </div>
    </div>
  );
}

function ValidationTextarea({ wide, value }: { wide?: boolean; value: string }) {
  const [internalValue, setValue] = useState(value);
  const isValid = useMemo(() => internalValue.length >= 50, [internalValue]);

  return (
    <Textarea
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
