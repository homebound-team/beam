import { Meta } from "@storybook/react";
import { useState } from "react";
import { RichTextEditor as RichTextEditorComponent } from "src/components/RichTextEditor";

export default {
  component: RichTextEditor,
  title: "Components/Rich Text Editor",
} as Meta;

export function RichTextEditor() {
  return <TestEditor />;
}

function TestEditor() {
  const [value, setValue] = useState("");
  return (
    <>
      <RichTextEditorComponent label="Comment" value={value} onChange={setValue} mergeTags={["foo", "bar", "zaz"]} />
      value: {value}
    </>
  );
}
