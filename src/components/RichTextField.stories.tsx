import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useState } from "react";
import { RichTextField as RichTextFieldComponent } from "src/components/RichTextField";
import { Css } from "src/Css";
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
      placeholder="Enter Text"
      onBlur={noop}
      onFocus={noop}
    />
  );
}

export function ToggleReadOnly() {
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>();

  return (
    <>
      <RichTextFieldComponent
        label="Comment"
        value={value}
        onChange={(html, _text, tags) => {
          setValue(html);
        }}
        readOnly={readOnly}
        placeholder="Enter Text"
        onBlur={noop}
        onFocus={noop}
      />
      <button css={Css.mt2.p1.bgLightBlue700.white.$} onClick={() => setReadOnly(!readOnly)}>
        Toggle ReadOnly
      </button>
    </>
  );
}
