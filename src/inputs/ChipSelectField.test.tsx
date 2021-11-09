import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { ChipSelectField, ChipSelectFieldProps } from "src/inputs/ChipSelectField";
import { Value } from "src/inputs/Value";
import { Optional } from "src/types";
import { maybeCall } from "src/utils";
import { click, render } from "src/utils/rtl";

describe("ChipSelectField", () => {
  it("renders", async () => {
    // Given a ChipSelectField
    const r = await render(<TestComponent label="Test Label" value="s:2" options={sports} />);
    // Then the initial value should display
    expect(r.chipSelectField()).toHaveTextContent("Soccer");
    // And the label should display
    expect(r.chipSelectField_label()).toHaveTextContent("Test Label");
  });

  it("can set custom testids", async () => {
    // Given a ChipSelectField with a custom test id
    const r = await render(<TestComponent label="Test Label" value="s:2" options={sports} data-testid="customId" />);
    // Then the testid is used for the component
    expect(r.customId()).toBeTruthy();
    expect(r.customId_label()).toBeTruthy();
  });

  it("displays custom placeholder", async () => {
    // Given a ChipSelectField without a value and a custom placeholder
    const r = await render(
      <TestComponent label="Test Label" value={undefined} options={sports} placeholder="+ Task Status" />,
    );
    // Then the custom placeholder is shown
    expect(r.chipSelectField()).toHaveTextContent("+ Task Status");
  });

  it("is clearable", async () => {
    // Given a ChipSelectField that is clearable
    const onSelect = jest.fn();
    const r = await render(<TestComponent label="Label" value="s:2" options={sports} clearable onSelect={onSelect} />);
    // With an existing value
    expect(r.chipSelectField()).toHaveTextContent("Soccer");
    // When clicking the clear button
    click(r.chipSelectField_clearButton);
    // Then expect the default placeholder value to display
    expect(r.chipSelectField()).toHaveTextContent("Select an option");
    // And the clear button is removed when no value is selected
    expect(r.queryByTestId("chipSelectField_clearButton")).toBeFalsy();
    // And onSelect to be called
    expect(onSelect).toBeCalledWith([undefined, undefined]);
  });

  it("can select options", async () => {
    // Given a ChipSelectField
    const onSelect = jest.fn();
    const r = await render(<TestComponent label="Label" value="s:2" options={sports} onSelect={onSelect} />);
    // With an existing value
    expect(r.chipSelectField()).toHaveTextContent("Soccer");
    // When selecting a new value
    click(r.chipSelectField);
    click(r.getByRole("option", { name: "Basketball" }));
    // Then the field's value updates
    expect(r.chipSelectField()).toHaveTextContent("Basketball");
    // And onSelect is called
    expect(onSelect).toBeCalledWith(["s:3", sports[2]]);
  });

  it("fires onFocus and onBlur events", async () => {
    // Given a ChipSelectField
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
      <TestComponent label="Label" value="s:2" options={sports} onFocus={onFocus} onBlur={onBlur} />,
    );
    // When firing focus and blur events, then expect callbacks to be triggered
    fireEvent.focus(r.chipSelectField());
    expect(onFocus).toBeCalledTimes(1);
    fireEvent.blur(r.chipSelectField());
    expect(onBlur).toBeCalledTimes(1);
  });

  it("does not fire onBlur when opening menu and returns focus to the button upon selecting from menu", async () => {
    // Given a ChipSelectField
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
      <TestComponent label="Label" value="s:2" options={sports} onFocus={onFocus} onBlur={onBlur} />,
    );

    // When focusing the field and opening the menu
    click(r.chipSelectField);
    // And onFocus should have been called
    expect(onFocus).toBeCalledTimes(1);
    // And when firing the blur event while the menu is opened,
    fireEvent.blur(r.chipSelectField());
    // Then the onBlur event should not be called
    expect(onBlur).toBeCalledTimes(0);

    // When closing the menu (by selecting an option)
    click(r.getByRole("option", { name: "Basketball" }));
    // Then the focus is returned to the field
    expect(onFocus).toBeCalledTimes(2);
    // When firing the onBlur event
    fireEvent.blur(r.chipSelectField());
    // Then expect blur is now able to be called
    expect(onBlur).toBeCalledTimes(1);
  });
});

function TestComponent<O, V extends Value>(
  props: Optional<ChipSelectFieldProps<O, V>, "onSelect" | "getOptionLabel" | "getOptionValue">,
) {
  const { value, onSelect, ...others } = props;
  const [internalValue, setValue] = useState(value);
  return (
    <ChipSelectField
      value={internalValue}
      {...others}
      onSelect={(v, o) => {
        setValue(v);
        maybeCall(onSelect, [v, o]);
      }}
      getOptionValue={(o) => (o as any).id}
      getOptionLabel={(o) => (o as any).name}
    />
  );
}

const sports = [
  { id: "s:1", name: "Football" },
  { id: "s:2", name: "Soccer" },
  { id: "s:3", name: "Basketball" },
  { id: "s:4", name: "Baseball" },
];
