import { render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { TextField, TextFieldProps } from "src/inputs";

let lastSet: any = undefined;

describe("TextFieldTest", () => {
  it("can set a value", async () => {
    const r = await render(<TestTextField value="foo" />);
    expect(r.name()).toHaveValue("foo");
    type(r.name, "bar");
    expect(r.name()).toHaveValue("bar");
  });

  it("can set to undefined", async () => {
    const r = await render(<TestTextField value="foo" />);
    type(r.name, "");
    fireEvent.blur(r.name());
    expect(r.name()).toHaveValue("");
    expect(lastSet).toBeUndefined();
  });

  it("sets aria-required if required", async () => {
    const r = await render(<TestTextField value="foo" required={true} />);
    expect(r.name()).toHaveAttribute("aria-required", "true");
  });

  it("doesn't set aria-required if not required", async () => {
    const r = await render(<TestTextField value="foo" required={false} />);
    expect(r.name()).not.toHaveAttribute("aria-required");
  });

  it("sets aria-validation if invalid", async () => {
    const r = await render(<TestTextField value="foo" errorMsg="Required" />);
    expect(r.name()).toHaveAttribute("aria-invalid", "true");
  });

  it("does not fire focus/blur when readOnly", async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const r = await render(<TestTextField value="foo" readOnly={true} onBlur={onBlur} onFocus={onFocus} />);
    fireEvent.focus(r.name());
    fireEvent.blur(r.name());
    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
  });
});

function TestTextField(props: Omit<TextFieldProps, "onChange" | "label">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <TextField
      label="Name"
      value={internalValue}
      onChange={(v) => {
        lastSet = v;
        setValue(v);
      }}
      {...otherProps}
    />
  );
}
