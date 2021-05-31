import { render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { TextAreaField, TextAreaFieldProps } from "src/inputs";

let lastSet: any = undefined;

describe("TextAreaFieldTest", () => {
  it("can set a value", async () => {
    const r = await render(<TestTextAreaField value="foo" />);
    expect(r.note()).toHaveValue("foo");
    type(r.note, "bar");
    expect(r.note()).toHaveValue("bar");
  });

  it("can set to undefined", async () => {
    const r = await render(<TestTextAreaField value="foo" />);
    type(r.note, "");
    fireEvent.blur(r.note());
    expect(r.note()).toHaveValue("");
    expect(lastSet).toBeUndefined();
  });
});

function TestTextAreaField(props: Omit<TextAreaFieldProps, "onChange">) {
  const { value, label = "Note", ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <TextAreaField
      label={label}
      value={internalValue}
      onChange={(v) => {
        lastSet = v;
        setValue(v);
      }}
      {...otherProps}
    />
  );
}
