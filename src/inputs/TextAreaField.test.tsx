import { render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { Only } from "src/Css";
import { TextAreaField, TextAreaFieldProps } from "src/inputs";
import { TextFieldXss } from "src/interfaces";

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

  it("does not fire focus/blur when readOnly", async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const r = await render(<TestTextAreaField value="foo" readOnly={true} onFocus={onFocus} onBlur={onBlur} />);
    fireEvent.focus(r.note());
    fireEvent.blur(r.note());
    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("fires blur when preventNewLines is set and hitting the Enter key", async () => {
    const onBlur = jest.fn();
    const r = await render(<TestTextAreaField value="foo" onBlur={onBlur} preventNewLines />);
    r.note().focus();
    expect(r.note()).toHaveFocus();
    fireEvent.keyDown(r.note(), { key: "Enter" });
    expect(r.note()).not.toHaveFocus();
    expect(onBlur).toBeCalledTimes(1);
  });
});

function TestTextAreaField<X extends Only<TextFieldXss, X>>(props: Omit<TextAreaFieldProps<X>, "onChange" | "label">) {
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
