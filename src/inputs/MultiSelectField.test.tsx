import { click, input, render } from "@homebound/rtl-utils";
import { useState } from "react";
import { MultiSelectField, MultiSelectFieldProps, Value } from "src/inputs";

const options = [
  { id: "1", name: "One" },
  { id: "2", name: "Two" },
  { id: "3", name: "Three" },
];

describe("MultiSelectFieldTest", () => {
  const onSelect = jest.fn();

  it("can set a value", async () => {
    // Given a MultiSelectField
    const { getByRole } = await render(
      <TestMultiSelectField
        label="Age"
        values={["1"] as string[]}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
      />,
    );
    // That initially has "One" selected
    const text = getByRole("combobox");
    expect(text).toHaveValue("One");
    // When we select the 3rd option
    text.focus();
    input(text, "");
    click(getByRole("option", { name: "Three" }));
    // Then onSelect was called
    expect(onSelect).toHaveBeenCalledWith(["1", "3"]);
  });

  function TestMultiSelectField<O, V extends Value>(props: Omit<MultiSelectFieldProps<O, V>, "onSelect">): JSX.Element {
    const [selected, setSelected] = useState<V[]>(props.values);
    return (
      <MultiSelectField<O, V>
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
