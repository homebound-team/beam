import { click, render } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { SelectField, SelectFieldProps, Value } from "src/inputs";
import { wait } from "src/utils/rtl";

describe("SelectFieldTest", () => {
  const onSelect = jest.fn();

  it("can set a value", async () => {
    // Given a MultiSelectField
    const onBlur = jest.fn();
    const r = await render(
      <TestSelectField
        label="Age"
        value={"1"}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
        onBlur={onBlur}
      />,
    );
    // That initially has "One" selected
    expect(r.age()).toHaveValue("One");
    // When we focus the field to open the menu
    r.age().focus();
    expect(r.age()).toHaveFocus();
    // And we select the 3rd option
    click(r.getByRole("option", { name: "Three" }));
    // Then onSelect was called
    expect(onSelect).toHaveBeenCalledWith("3");
    // And the field is no longer in focus
    expect(r.age()).not.toHaveFocus();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("does not fire focus/blur when readOnly", async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { age } = await render(
      <TestSelectField
        label="Age"
        value={"1"}
        readOnly={true}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        onFocus={onFocus}
        onBlur={onBlur}
        data-testid="age"
      />,
    );
    fireEvent.focus(age());
    fireEvent.blur(age());
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocus).not.toHaveBeenCalled();
  });

  it("resets input value on blur if it does not match the selected option", async () => {
    // Given a Select Field without a selected option
    const { age, getByRole } = await render(
      <TestSelectField
        label="Age"
        value={undefined}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // When changing the inputs value, and not selecting an option
    fireEvent.input(age(), { target: { value: "asdf" } });
    // And `blur`ing the field
    fireEvent.blur(age());
    // Then expect the value to be reset to empty
    expect(age()).toHaveValue("");

    // Given a selected option
    fireEvent.focus(age());
    fireEvent.input(age(), { target: { value: "T" } });
    click(getByRole("option", { name: "Three" }));
    // When changing the inputs value to no longer match the selected option
    fireEvent.input(age(), { target: { value: "asdf" } });
    // And `blur`ing the field
    fireEvent.blur(age());
    // Then expect the value to be reset to the selected option
    expect(age()).toHaveValue("Three");
  });

  it("can initialize with an 'undefined' value", async () => {
    // Given a Select Field with an undefined value
    const { age, getByRole } = await render(
      <TestSelectField
        label="Age"
        value={undefined}
        options={[{ id: undefined, name: "Unassigned" }, ...options]}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // Then expect the value to be that of the `undefined` entry
    expect(age()).toHaveValue("Unassigned");
  });

  it("can select an 'undefined' value", async () => {
    // Given a Select Field with a value selected
    const { age, getByRole } = await render(
      <TestSelectField
        label="Age"
        value="1"
        options={[{ id: undefined, name: "Unassigned" }, ...options]}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // When selecting the option with an `undefined` value
    fireEvent.focus(age());
    click(getByRole("option", { name: "Unassigned" }));
    // Then expect the value to be that of the `undefined` entry
    expect(age()).toHaveValue("Unassigned");
  });

  it("respects disabled options", async () => {
    const onSelect = jest.fn();
    // Given a Select Field with a disabled option
    const { age, getByRole } = await render(
      <SelectField
        label="Age"
        value="1"
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
        disabledOptions={["2"]}
        onSelect={onSelect}
      />,
    );
    // When opening the menu
    fireEvent.focus(age());
    const optionTwo = getByRole("option", { name: "Two" });
    // Then expect the disabled option to have the correct aria attributes
    expect(optionTwo).toHaveAttribute("aria-disabled", "true");
    // And when clicking on that option
    click(optionTwo);
    // Then the `onSelect` callback is not called
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("can load options via options prop callback", async () => {
    // Given a Select Field with options that are loaded via a callback
    const r = await render(
      <TestSelectField
        label="Age"
        value="1"
        options={{ initial: [options[0]], load: async () => ({ options }) }}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // When opening the menu
    fireEvent.focus(r.age());
    // Then expect to see the initial option and loading state
    expect(r.getAllByRole("option")).toHaveLength(1);
    expect(r.loadingDots()).toBeTruthy();
    // And when waiting for the promise to resolve
    await wait();
    // Then expect the rest of the options to be loaded in and the loading state to be removed
    expect(r.getAllByRole("option")).toHaveLength(3);
    expect(r.queryByTestId("loadingDots")).toBeFalsy();
  });

  it("reflects new options when prop changes", async () => {
    // Given a Select Field with options that are loaded via a callback
    const r = await render(
      <TestSelectField
        label="Age"
        value="1"
        options={[options[0]]}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // When opening the menu
    fireEvent.focus(r.age());
    // Then expect to see the initial option
    expect(r.getAllByRole("option")).toHaveLength(1);
    // And when changing the options
    click(r.updateOptions);
    // Then expect the rest of the options to be loaded in
    expect(r.getAllByRole("option")).toHaveLength(3);
  });

  const options = [
    { id: "1", name: "One" },
    { id: "2", name: "Two" },
    { id: "3", name: "Three" },
  ];

  function TestSelectField<O, V extends Value>(props: Omit<SelectFieldProps<O, V>, "onSelect">): JSX.Element {
    const [selected, setSelected] = useState<V | undefined>(props.value);
    const [initOptions, setOptions] = useState(props.options);
    return (
      <>
        <SelectField<O, V>
          {...props}
          options={initOptions}
          value={selected}
          onSelect={(value) => {
            onSelect(value);
            setSelected(value);
          }}
        />
        <button data-testid="updateOptions" onClick={() => setOptions(options as any)} />
      </>
    );
  }
});
