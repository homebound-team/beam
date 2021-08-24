import { click, input, render, RenderResult } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { MultiSelectField, MultiSelectFieldProps } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";

const options = [
  { id: "1", name: "One" },
  { id: "2", name: "Two" },
  { id: "3", name: "Three" },
];

describe("MultiSelectFieldTest", () => {
  const onSelect = jest.fn();

  it("can set a value", async () => {
    // Given a MultiSelectField with 1 selected value
    const r = await render(<TestMultiSelectField values={["1"] as string[]} options={options} />);
    // That initially has "One" selected
    expect(r.getByRole("combobox")).toHaveValue("One");
    // When we select the 3rd option
    selectOption(r, "Three");
    // Then onSelect was called
    expect(onSelect).toHaveBeenCalledWith(["1", "3"]);
  });

  it("has an empty text box not set", async () => {
    // Given a MultiSelectField with no selected values
    const { getByRole } = await render(<TestMultiSelectField values={[]} options={options} />);
    // That initially has "One" selected
    const text = getByRole("combobox");
    expect(text).toHaveValue("");
  });

  it("can have custom an empty text", async () => {
    // Given a MultiSelectField with no selected values
    const r = await render(<TestMultiSelectField values={[]} options={options} nothingSelectedText="All" />);
    const text = r.getByRole("combobox");
    // Then expect the text input value to show the `nothingSelectedText` value
    expect(text).toHaveValue("All");
  });

  it("only populates input field with selected single option on blur", async () => {
    // Given a MultiSelectField with no selected values
    const r = await render(<TestMultiSelectField values={[]} options={options} nothingSelectedText="All" />);
    // That initially has "One" selected
    const text = r.getByRole("combobox");
    // And when we select the first option
    selectOption(r, "One");
    // Then the input field is still empty
    expect(text).toHaveValue("");

    // When blurring the field
    fireEvent.blur(text);
    // Then the field should populate with the selected options's value.
    expect(text).toHaveValue("One");
  });

  it("resets input value on blur if it does not match the selected option", async () => {
    // Given a MultiSelectField without a selected options
    const { getByRole, age } = await render(<TestMultiSelectField values={[]} options={options} />);
    // When changing the inputs value, and not selecting an option
    input(age(), "asdf");
    // And `blur`ing the field
    fireEvent.blur(age());
    // Then expect the value to be reset to empty
    expect(age()).toHaveValue("");

    // Given a selected option
    fireEvent.focus(age());
    input(age(), "T");
    click(getByRole("option", { name: "Three" }));
    // When changing the inputs value to no longer match the selected option
    input(age(), "asdf");
    // And `blur`ing the field
    fireEvent.blur(age());
    // Then expect the value to be reset to the selected option
    expect(age()).toHaveValue("Three");

    // When selecting multiple options
    fireEvent.focus(age());
    input(age(), "T");
    click(getByRole("option", { name: "Two" }));
    // Then the input value should be empty
    expect(age()).toHaveValue("");
    // When changing the inputs value to no longer be empty, as expected for multiple options
    input(age(), "asdf");
    // And `blur`ing the field
    fireEvent.blur(age());
    // Then expect the value to be reset to empty
    expect(age()).toHaveValue("");
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

  function TestMultiSelectField(
    props: Optional<
      MultiSelectFieldProps<HasIdAndName<string>, string>,
      "label" | "onSelect" | "getOptionLabel" | "getOptionValue"
    >,
  ): JSX.Element {
    const [selected, setSelected] = useState(props.values);
    return (
      <MultiSelectField
        label="Age"
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        {...props}
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
  text.focus();
  input(text, "");
  click(r.getByRole("option", { name }));
}
