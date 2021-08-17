import { camelCase } from "change-case";
import { useState } from "react";
import { useTestIds } from "src/utils";
import { RichTextFieldProps } from "./RichTextField";

/** Mocks out `RichTextField` as a text `<input>` field. */
export function RichTextField(props: RichTextFieldProps) {
  const { onBlur = () => {}, onFocus = () => {}, readOnly } = props;
  const [value, setValue] = useState(props.value || "");
  const tid = useTestIds(props, defaultTestId(props.label || "richTextField"));
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        const { value } = e.target;
        setValue(value);
        props.onChange(value, value, props.mergeTags || []);
      }}
      onBlur={onBlur}
      onFocus={onFocus}
      readOnly={readOnly}
      {...tid}
    />
  );
}

function defaultTestId(label: string): string {
  return camelCase(label);
}
