import { action } from "@storybook/addon-actions";
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
  const [tags, setTags] = useState<string[]>([]);
  return (
    <>
      <RichTextFieldComponent
        label="Comment"
        value={value}
        onChange={(html, _text, tags) => {
          setValue(html);
          setTags(tags);
        }}
        mergeTags={["foo", "bar", "zaz"]}
        autoFocus
        placeholder="Enter Text"
        // Used to validate input states
        onBlur={action("onBlur")}
        onFocus={action("onFocus")}
      />
      <div>value: {value === undefined ? "undefined" : value}</div>
      <div>tags: {tags.join(", ")}</div>
    </>
  );
}
