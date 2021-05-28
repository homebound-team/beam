import { Meta } from "@storybook/react";
import { useState } from "react";
import { RichTextEditor } from "src/components/RichTextEditor";

export default {
  component: RichTextEditor,
  title: "Components/Rich Text Editor",
} as Meta;

export function RichTextEditors() {
  return <TestEditor />;
}

function TestEditor() {
  const [value, setValue] = useState("");
  return (
    <>
      <RichTextEditor label="Comment" value={value} onChange={setValue} mergeTags={["foo", "bar", "zaz"]} />
      value: {value}
    </>
  );
}
