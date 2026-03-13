import { click, render, RenderResult } from "@homebound/rtl-utils";
import { act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { MultiSelectField, MultiSelectFieldProps } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";
import { focus } from "src/utils/rtl";
import { vi } from "vitest";

const options = [
  { id: "1", name: "One" },
  { id: "2", name: "Two" },
  { id: "3", name: "Three" },
];

const unsortedOptions: HasIdAndName[] = [
  { id: "1", name: "Zebra" },
  { id: "2", name: "Apple" },
  { id: "3", name: "Mango" },
  { id: "4", name: "Banana" },
];

describe("MultiSelectFieldTest", () => {
  const onSelect = vi.fn();

  it("can set a value", async () => {
    // Given a MultiSelectField with 1 selected value
    const r = await render(<TestMultiSelectField values={["1"] as string[]} options={options} />);
    // That initially has "One" selected
    expect(r.age).toHaveValue("One");
    // When we select the 3rd option
    selectOption(r, "Three");
    // Then onSelect was called
    expect(onSelect).toHaveBeenCalledWith(["1", "3"]);
  });

  it("renders a chip for each selected item", async () => {
    // Given a MultiSelectField with 3 selected value
    const r = await render(<TestMultiSelectField values={["1", "2", "3"] as string[]} options={options} />);

    // Then we can see 3 chips rendered
    const selectionChips = r.queryAllByTestId("chip");
    expect(selectionChips).toHaveLength(3);

    // And they are rendered with names of the selected options in alphabetical order (autoSort=true by default)
    expect(selectionChips[0]).toHaveTextContent("One");
    expect(selectionChips[1]).toHaveTextContent("Three");
    expect(selectionChips[2]).toHaveTextContent("Two");
  });

  it("has an empty text box not set", async () => {
    // Given a MultiSelectField with no selected values
    const r = await render(<TestMultiSelectField values={[]} options={options} />);
    // That initially has "One" selected
    expect(r.age).toHaveValue("");
  });

  it("can have custom an empty text", async () => {
    // Given a MultiSelectField with no selected values
    const r = await render(<TestMultiSelectField values={[]} options={options} nothingSelectedText="All" />);
    // Then expect the text input value to show the `nothingSelectedText` value
    expect(r.age).toHaveValue("All");
  });

  it("only populates input field with selected single option on blur", async () => {
    // Given a MultiSelectField with no selected values
    const r = await render(<TestMultiSelectField values={[]} options={options} nothingSelectedText="All" />);
    // And when we select the first option
    selectOption(r, "One");
    // Then the input field is still empty
    expect(r.age).toHaveValue("");

    // When blurring the field
    fireEvent.blur(r.age);
    // Then the field should populate with the selected option's value.
    expect(r.age).toHaveValue("One");
  });

  it("resets input value on blur if it does not match the selected option", async () => {
    // Given a MultiSelectField without a selected options
    const r = await render(<TestMultiSelectField values={[]} options={options} />);
    // When changing the inputs value, and not selecting an option
    fireEvent.input(r.age, "asdf");
    // And `blur`ing the field
    fireEvent.blur(r.age);
    // Then expect the value to be reset to empty
    expect(r.age).toHaveValue("");

    // Given a selected option
    selectOption(r, "Three");
    // When changing the inputs value to no longer match the selected option
    fireEvent.input(r.age, "asdf");

    // And `blur`ing the field
    // fireEvent.blur(r.age);
    // Calling blur twice - First blur closes menu and retains focus on input. Second blur actually blurs the input.
    fireEvent.blur(r.age);
    // Then expect the value to be reset to the selected option
    expect(r.age).toHaveValue("Three");

    // When selecting multiple options
    selectOption(r, "Two");
    // Then the input value should be empty
    expect(r.age).toHaveValue("");
    // When changing the inputs value to no longer be empty, as expected for multiple options
    fireEvent.input(r.age, "asdf");
    // And `blur`ing the field
    act(() => r.age.blur());
    // Then expect the value to be reset to empty
    expect(r.age).toHaveValue("");
  });

  it("does not populate input field with multiple items selected", async () => {
    // Given a MultiSelectField with no selected values
    const r = await render(<TestMultiSelectField values={[]} options={options} nothingSelectedText="All" />);
    const text = r.getByRole("combobox");

    // When we select two options
    selectOption(r, "One");
    selectOption(r, "Two");

    // And when blurring the field
    fireEvent.blur(text);

    // Then the input field is stay empty
    expect(text).toHaveValue("");
  });

  it("respects disabled options", async () => {
    const onSelect = vi.fn();
    // Given a Select Field with a disabled option
    const r = await render(
      <MultiSelectField
        label="Age"
        values={["1"]}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
        disabledOptions={["2"]}
        onSelect={onSelect}
      />,
    );
    // When opening the menu
    fireEvent.click(r.age);
    const optionTwo = r.getByRole("option", { name: "Two" });
    // Then expect the disabled option to have the correct aria attributes
    expect(optionTwo).toHaveAttribute("aria-disabled", "true");
    // And when clicking on that option
    click(optionTwo);
    // Then the `onSelect` callback is not called
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("sets chips to disabled for options that are already selected and disabled", async () => {
    const onSelect = vi.fn();
    // Given a Select Field with a selected disabled option
    const r = await render(
      <MultiSelectField
        label="Age"
        values={["1"]}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
        disabledOptions={["1"]}
        onSelect={onSelect}
      />,
    );
    // When opening the menu
    fireEvent.click(r.age);
    // Then expect the chip to be disabled
    const chips = r.queryAllByTestId("chip");
    expect(chips[1]).toHaveAttribute("disabled");
    // And when clicking on that chip
    click(chips[1]);
    // Then the `onSelect` callback is not called
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("retains state of disabled options that are already selected", async () => {
    const onSelect = vi.fn();
    // Given a Select Field with a disabled option that is a selected value
    const r = await render(
      <MultiSelectField
        label="Age"
        values={["1"]}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
        disabledOptions={["1"]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(r.age);
    const optionTwo = r.getByRole("option", { name: "Two" });
    // When selecting another option
    click(optionTwo);
    // Then the `onSelect` is returned with both the new value and the disabled value.
    expect(onSelect).toHaveBeenCalledWith(
      ["1", "2"],
      [
        { id: "1", name: "One" },
        { id: "2", name: "Two" },
      ],
    );
  });

  it("can remove options by clicking the chips", async () => {
    // Given a MultiSelectField with a selected option
    const r = await render(<TestMultiSelectField values={["1"]} options={options} />);
    // When opening the menu
    click(r.age);
    // And clicking on the chip
    const chips = r.queryAllByTestId("chip");
    click(chips[1]);
    // Then the menu remains open
    expect(r.getByRole("listbox")).toBeInTheDocument();
    // And `onSelect` is called with the correct values
    expect(onSelect).toHaveBeenCalledWith([]);
  });

  it("preserves selections after tab-blur", async () => {
    const selectedRef: React.MutableRefObject<string[] | undefined> = { current: undefined };
    // Given a MultiSelectField with no selected values
    const r = await render(<TestMultiSelectField values={[]} options={options} selectedRef={selectedRef} />);
    // When we select an option
    selectOption(r, "One");
    // Then onSelect was called with the new value
    expect(onSelect).toHaveBeenCalledWith(["1"]);
    onSelect.mockClear();

    // When we Tab out of the field (Tab fires keydown then blur)
    fireEvent.keyDown(r.age, { key: "Tab" });
    fireEvent.blur(r.age);

    // Then onSelect should NOT have been called again with reverted values
    // (Bug: Tab → state.commit() → selectionManager.select(focusedKey) toggles the focused item off)
    expect(onSelect).not.toHaveBeenCalledWith([]);

    // And the component's internal selected state should still hold ["1"]
    expect(selectedRef.current).toEqual(["1"]);

    // And the selection should persist — chip for "One" should still be visible
    const chips = r.queryAllByTestId("chip");
    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveTextContent("One");
  });

  it("preserves multiple selections after tab-blur", async () => {
    const selectedRef: React.MutableRefObject<string[] | undefined> = { current: undefined };
    // Given a MultiSelectField with no selected values
    const r = await render(<TestMultiSelectField values={[]} options={options} selectedRef={selectedRef} />);
    // When we select two options
    selectOption(r, "One");
    selectOption(r, "Two");
    expect(onSelect).toHaveBeenLastCalledWith(["1", "2"]);
    onSelect.mockClear();

    // When we Tab out of the field
    fireEvent.keyDown(r.age, { key: "Tab" });
    fireEvent.blur(r.age);

    // Then the selections should persist
    expect(onSelect).not.toHaveBeenCalledWith([]);
    expect(onSelect).not.toHaveBeenCalledWith(["1"]);

    // And the component's internal selected state should still hold both values
    expect(selectedRef.current).toEqual(["1", "2"]);

    // And chips should reflect both selections
    const chips = r.queryAllByTestId("chip");
    expect(chips).toHaveLength(2);
  });

  it("does not fire onSelect on blur when values haven't changed", async () => {
    // Given a MultiSelectField with selected values
    onSelect.mockClear();
    const r = await render(<TestMultiSelectField values={["1", "2"] as string[]} options={options} />);
    // When we focus and then blur the field
    focus(r.age);
    fireEvent.blur(r.age);
    // Then onSelect is not called since the values didn't change
    expect(onSelect).not.toHaveBeenCalled();
  });

  describe("autoSort", () => {
    it("sorts options alphabetically by default", async () => {
      // Given a MultiSelectField with unsorted options
      const r = await render(<TestMultiSelectField values={[]} options={unsortedOptions} />);
      // When opening the menu
      click(r.age);
      // Then expect the options to be in alphabetical order
      const opts = r.queryAllByRole("option");
      expect(opts.map((o) => o.textContent)).toEqual(["Apple", "Banana", "Mango", "Zebra"]);
    });

    it("maintains original order when autoSort is false", async () => {
      // Given a MultiSelectField with autoSort disabled
      const r = await render(<TestMultiSelectField values={[]} options={unsortedOptions} autoSort={false} />);
      // When opening the menu
      click(r.age);
      // Then options should maintain their original order
      const opts = r.queryAllByRole("option");
      expect(opts.map((o) => o.textContent)).toEqual(["Zebra", "Apple", "Mango", "Banana"]);
    });

    it("works correctly with selected values after sorting", async () => {
      // Given a MultiSelectField with pre-selected values and unsorted options
      const r = await render(<TestMultiSelectField values={["1", "2"]} options={unsortedOptions} />);
      // When opening the menu
      click(r.age);
      // Then the options should be sorted
      const opts = r.queryAllByRole("option");
      expect(opts.map((o) => o.textContent)).toEqual(["Apple", "Banana", "Mango", "Zebra"]);

      // And the correct items should be checked
      expect(opts[0]).toHaveAttribute("aria-selected", "true"); // Zebra
      expect(opts[3]).toHaveAttribute("aria-selected", "true"); // Apple
    });
  });

  function TestMultiSelectField(
    props: Optional<
      MultiSelectFieldProps<HasIdAndName<string>, string>,
      "label" | "onSelect" | "getOptionLabel" | "getOptionValue"
    > & { selectedRef?: React.MutableRefObject<string[] | undefined> },
  ): JSX.Element {
    const { selectedRef, ...rest } = props;
    const [selected, setSelected] = useState(rest.values);
    if (selectedRef) selectedRef.current = selected;
    return (
      <MultiSelectField
        label="Age"
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        {...rest}
        values={selected}
        onSelect={(values) => {
          onSelect(values);
          setSelected(values);
        }}
        data-testid="age"
      />
    );
  }
});

function selectOption(r: RenderResult, name: string): void {
  const text = r.getByRole("combobox");
  focus(text);
  fireEvent.input(text, { target: { value: "" } });
  click(r.getByRole("option", { name }));
}
