import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { ChipSelectField, ChipSelectFieldProps } from "src";
import { Value } from "src/inputs/Value";
import { Optional } from "src/types";
import { maybeCall } from "src/utils";
import { click, focus, render, wait } from "src/utils/rtl";

describe("ChipSelectField", () => {
  it("renders", async () => {
    // Given a ChipSelectField
    const r = await render(<TestComponent label="Test Label" value="s:2" options={sports} />);
    // Then the initial value should display
    expect(r.chipSelectField).toHaveTextContent("Soccer").toHaveAttribute("title", "Soccer");
    // And the label should display
    expect(r.chipSelectField_label).toHaveTextContent("Test Label");
  });

  it("can set custom testids", async () => {
    // Given a ChipSelectField with a custom test id
    const r = await render(<TestComponent label="Test Label" value="s:2" options={sports} data-testid="customId" />);
    // Then the testid is used for the component
    expect(r.customId).toBeTruthy();
    expect(r.customId_label).toBeTruthy();
  });

  it("displays custom placeholder", async () => {
    // Given a ChipSelectField without a value and a custom placeholder
    const r = await render(
      <TestComponent label="Test Label" value={undefined} options={sports} placeholder="+ Task Status" />,
    );
    // Then the custom placeholder is shown
    expect(r.chipSelectField).toHaveTextContent("+ Task Status");
  });

  it("is clearable", async () => {
    // Given a ChipSelectField that is clearable
    const onSelect = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
      <TestComponent label="Label" value="s:2" options={sports} clearable onSelect={onSelect} onBlur={onBlur} />,
    );
    // With an existing value
    expect(r.chipSelectField).toHaveTextContent("Soccer");
    // When clicking the clear button
    click(r.chipSelectField_clearButton);
    // Then expect the default placeholder value to display
    expect(r.chipSelectField).toHaveTextContent("Select an option");
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
    expect(r.chipSelectField).toHaveTextContent("Soccer");
    // When selecting a new value
    click(r.chipSelectField);
    expect(r.getByRole("option", { name: "Basketball" }).firstChild).toHaveAttribute("title", "Basketball");
    click(r.getByRole("option", { name: "Basketball" }));
    // Then the field's value updates
    expect(r.chipSelectField).toHaveTextContent("Basketball");
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
    focus(r.chipSelectField);
    expect(onFocus).toBeCalledTimes(1);
    fireEvent.blur(r.chipSelectField);
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
    // And when firing the blur event with a related target being an element within the menu
    fireEvent.blur(r.chipSelectField, { relatedTarget: r.getByRole("option", { name: "Basketball" }) });
    // Then the onBlur event should not be called
    expect(onBlur).toBeCalledTimes(0);

    // When closing the menu (by selecting an option)
    click(r.getByRole("option", { name: "Basketball" }));
    // Then the focus is returned to the field
    expect(onFocus).toBeCalledTimes(2);
  });

  it("can disable field", async () => {
    const r = await render(<TestComponent label="Label" value="s:2" options={sports} disabled="Disabled reason" />);
    expect(r.chipSelectField).toBeDisabled();
  });

  it("handles onCreateNew flow", async () => {
    // Given a ChipSelectField with the onCreateNew prop
    const newOpt = { id: "s:100", name: "New Sport" };
    const onCreateNew = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
      <TestComponent
        label="Label"
        value="s:2"
        options={sports}
        onCreateNew={async (str) => onCreateNew(str)}
        onBlur={onBlur}
      />,
    );
    // When selecting the "Create new" option
    click(r.chipSelectField);
    click(r.getByRole("option", { name: "Create new" }));
    // Then onBlur should not be called initially when the ChipInputField is shown
    expect(onBlur).not.toBeCalled();
    // Then expect the select field to be removed and input field to show
    expect(r.chipSelectField_createNewField).toBeTruthy();
    expect(r.queryByTestId("chipSelectField")).not.toBeVisible();
    // And when entering a new value
    fireEvent.input(r.chipSelectField_createNewField, { target: { textContent: newOpt.name } });
    // And hitting the Enter key
    fireEvent.keyDown(r.chipSelectField_createNewField, { key: "Enter" });
    // Wait for the async request to finish
    await wait();
    // Then expect the text field to be removed
    expect(r.queryByTestId("chipSelectField_createNewField")).toBeFalsy();
    // And onCreateNew to be called with text field value
    expect(onCreateNew).toBeCalledWith(newOpt.name);
  });

  it("can escape out of Add New field", async () => {
    // Given a ChipSelectField with the onCreateNew prop
    const r = await render(<TestComponent label="Label" value="s:2" options={sports} onCreateNew={async () => {}} />);
    // When selecting the "Create new" option
    click(r.chipSelectField);
    click(r.getByRole("option", { name: "Create new" }));
    // And when hitting the Escape key
    fireEvent.keyDown(r.chipSelectField_createNewField, { key: "Escape" });
    // Then expect the text field to be removed
    expect(r.queryByTestId("chipSelectField_createNewField")).toBeFalsy();
    // And the previous selected value to still be shown
    expect(r.chipSelectField).toHaveTextContent("Soccer");
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
