import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { TextAreaField } from "src/components/TextAreaField";
import { Css } from "src/Css";

export default {
  component: TextAreaField,
  title: "Components/Text Areas",
} as Meta;

export function TextAreas() {
  return (
    <div css={Css.df.justifyAround.$}>
      <div>
        <TextAreaField />
        <br />
        <TextAreaField label="Description" />
        <br />
        <TextAreaField label="Description" defaultValue="An example description text." autoFocus />
        <br />
        <TextAreaField
          label="Description"
          defaultValue="This is a description that can no longer be edited."
          disabled
        />
        <br />
        <ValidationTextarea value="Not enough characters" />
      </div>
      <div>
        <TextAreaField />
        <br />
        <TextAreaField wide label="Description" />
        <br />
        <TextAreaField wide label="Description" defaultValue="An example description text." />
        <br />
        <TextAreaField
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
