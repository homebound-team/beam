import { camelCase } from "change-case";
import { useState } from "react";
import { useTestIds } from "src/utils";
import { RichTextFieldProps } from "./RichTextField";

export function RichTextField(props: RichTextFieldProps) {
  const [value, setValue] = useState(props.value || "");
  const tid = useTestIds(props, defaultTestId(props.label || "textField"));
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        const { value } = e.target;
        setValue(value);
        props.onChange(value, value, props.mergeTags || []);
      }}
      {...tid}
    />
  );
}

function defaultTestId(label: string): string {
  return camelCase(label);
}
