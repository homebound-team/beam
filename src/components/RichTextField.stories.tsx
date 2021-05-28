import { Meta } from "@storybook/react";
import { useState } from "react";
import { RichTextField as RichTextFieldComponent } from "src/components/RichTextField";

export default {
  component: RichTextFieldComponent,
  title: "Components/Rich Text Field",
} as Meta;

export function RichTextField() {
  return <TestField />;
}

function TestField() {
  const [value, setValue] = useState<string | undefined>();
  return (
    <>
      <RichTextFieldComponent label="Comment" value={value} onChange={setValue} mergeTags={["foo", "bar", "zaz"]} />
      value: {value === undefined ? "undefined" : value}
    </>
  );
}
