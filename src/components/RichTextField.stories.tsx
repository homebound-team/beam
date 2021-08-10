import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { RichTextField as RichTextFieldComponent } from "src/components/RichTextField";
import { noop } from "src/utils";

export default {
  component: RichTextFieldComponent,
  title: "Components/Rich Text Field",
} as Meta;

export function Editable() {
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

export function ReadOnly() {
  const value =
    "<div><!--block-->This is some content<br><br></div><ul><li><!--block-->this is a bullet</li><li><!--block--><em>another bullet here</em></li></ul><div><!--block--><br><strong>some really important content</strong></div>";
  return (
    <RichTextFieldComponent
      label="Comment"
      value={value}
      onChange={noop}
      readOnly={true}
      placeholder="No Content"
      onBlur={noop}
      onFocus={noop}
    />
  );
}
