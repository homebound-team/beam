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

  it("does not fire blur when readOnly", async () => {
    const onBlur = jest.fn();
    const r = await render(<TestTextAreaField value="foo" readOnly={true} onBlur={onBlur} />);
    fireEvent.blur(r.note());
    expect(onBlur).not.toHaveBeenCalled();
  });
});

function TestTextAreaField(props: Omit<TextAreaFieldProps, "onChange" | "label">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <TextAreaField
      label="Note"
      value={internalValue}
      onChange={(v) => {
        lastSet = v;
        setValue(v);
      }}
      {...otherProps}
    />
  );
}
