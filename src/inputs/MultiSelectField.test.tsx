import { click, input, render, RenderResult } from "@homebound/rtl-utils";
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
    // That initially has "One" selected
    const text = r.getByRole("combobox");
    expect(text).toHaveValue("All");
    // And when we select the first option
    selectOption(r, "One");
    // Then it changes to that one
    expect(text).toHaveValue("One");
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
