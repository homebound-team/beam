import { fireEvent } from "@testing-library/react";
import { ChipTextField } from "src/inputs/ChipTextField";
import { noop } from "src/utils";
import { render } from "src/utils/rtl";

describe("ChipTextField", () => {
  it("renders", async () => {
    // Given the input
    const r = await render(<ChipTextField label="Test Label" value="Test value" required onChange={noop} />);
    // Then all fields should be properly set
    expect(r.chipField())
      .toHaveTextContent("Test value")
      .toHaveAttribute("aria-label", "Test Label")
      .toHaveAttribute("aria-required", "true");
  });

  it("fires callbacks", async () => {
    // Given the component with callback functions
    const onChange = jest.fn();
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const onEnter = jest.fn();
    const r = await render(
      <ChipTextField label="Test Label" onChange={onChange} onBlur={onBlur} onFocus={onFocus} onEnter={onEnter} />,
    );

    // When firing the events on the input, then expect the callbacks to be invoked
    fireEvent.focus(r.chipField());
    expect(onFocus).toBeCalledTimes(1);

    fireEvent.blur(r.chipField());
    expect(onBlur).toBeCalledTimes(1);

    fireEvent.keyDown(r.chipField(), { key: "Enter" });
    expect(onEnter).toBeCalledTimes(1);

    fireEvent.input(r.chipField(), { target: { textContent: "New Value" } });
    expect(onChange).toBeCalledWith("New Value");
  });

  it("removes focus from input and calls onBlur when pressing escape", async () => {
    const onBlur = jest.fn();
    // Given the Chip Input
    const r = await render(<ChipTextField label="Test Label" onChange={noop} onBlur={onBlur} />);
    // With focus
    r.chipField().focus();
    expect(r.chipField()).toHaveFocus();
    // When pressing the escape key
    fireEvent.keyDown(r.chipField(), { key: "Escape" });
    // Then the element should no longer have focus
    expect(r.chipField()).not.toHaveFocus();
    // And onBlur should have been called
    expect(onBlur).toBeCalledTimes(1);
  });

  it("does not removes focus or call onBlur from input when pressing escape disabled", async () => {
    const onBlur = jest.fn();
    // Given the Chip Input
    const r = await render(<ChipTextField label="Test Label" onChange={noop} blurOnEscape={false} onBlur={onBlur} />);
    // With focus
    r.chipField().focus();
    expect(r.chipField()).toHaveFocus();
    // When pressing the escape key
    fireEvent.keyDown(r.chipField(), { key: "Escape" });
    // Then the element should still have focus
    expect(r.chipField()).toHaveFocus();
    // And onBlur should not be called
    expect(onBlur).not.toBeCalled();
  });
});
