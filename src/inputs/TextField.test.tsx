import { render, type } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useRef, useState } from "react";
import { Only } from "src/Css";
import { TextField, TextFieldApi, TextFieldProps } from "src/inputs";
import { TextFieldXss } from "src/interfaces";
import { click } from "src/utils/rtl";

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
    expect(r.name()).toHaveAttribute("data-readonly");
    fireEvent.focus(r.name());
    fireEvent.blur(r.name());
    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("is clearable", async () => {
    // Given an input that has the "clear" button
    const r = await render(<TestTextField value="foo" clearable />);
    // The "clear" button should not be shown until input is focused
    expect(r.queryByTestId("xCircle")).toBeFalsy();
    // When focused on the input
    fireEvent.focus(r.name());
    // Then the clear button is shown.
    expect(r.xCircle()).toBeTruthy();

    expect(r.name()).toHaveValue("foo");
    // When clicking the clear button
    click(r.xCircle);
    // Then the value should be removed
    expect(r.name()).toHaveValue("");
    // And the focus should return to the input element
    expect(r.name()).toHaveFocus();
  });

  it("can use TextFielApi to focus input", async () => {
    const onFocus = jest.fn();
    // Given a textfield
    const r = await render(<TestTextField value="foo" onFocus={onFocus} />);
    // With the field not in focus
    expect(r.name()).not.toHaveFocus();
    // When clicking a button to use the TextFieldApi.focus method
    click(r.setFocus);
    // Then expect field to now be in focus
    expect(r.name()).toHaveFocus();
    // And onFocus callback to be called
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it("can trigger onEnter callback", async () => {
    const onEnter = jest.fn();
    const onBlur = jest.fn();
    // Given a Textfield
    const r = await render(<TestTextField value="foo" onEnter={onEnter} onBlur={onBlur} />);
    // With focus
    r.name().focus();
    expect(r.name()).toHaveFocus();
    // When hitting the Enter key
    fireEvent.keyDown(r.name(), { key: "Enter" });
    // Then onEnter and onBlur callbacks should be called
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(r.name()).not.toHaveFocus();
  });
});

function TestTextField<X extends Only<TextFieldXss, X>>(props: Omit<TextFieldProps<X>, "onChange" | "label">) {
  const { value, ...otherProps } = props;
  const [internalValue, setValue] = useState(value);
  const textFieldApi = useRef<TextFieldApi | undefined>();
  return (
    <>
      <TextField
        label="Name"
        value={internalValue}
        onChange={(v) => {
          lastSet = v;
          setValue(v);
        }}
        api={textFieldApi}
        {...otherProps}
      />
      <button onClick={() => textFieldApi.current && textFieldApi.current.focus()} data-testid="setFocus" />
    </>
  );
}
