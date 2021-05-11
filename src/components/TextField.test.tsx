import { render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { TextField, TextFieldProps } from "src/components/TextField";

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
});

function TestTextField(props: Omit<TextFieldProps, "onChange">) {
  const { value, label = "Name", ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <TextField
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
