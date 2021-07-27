import { click, input, render } from "@homebound/rtl-utils";
import { useState } from "react";
import { idAndName, SelectField, SelectFieldProps, Value } from "src/inputs";

const options = [
  { id: "1", name: "One" },
  { id: "2", name: "Two" },
  { id: "3", name: "Three" },
];

describe("SelectFieldTest", () => {
  const onSelect = jest.fn();

  it("can set a value", async () => {
    // Given a MultiSelectField
    const { getByRole } = await render(
      <TestSelectField label="Age" value={"1"} options={options} mapOption={idAndName} />,
    );
    // That initially has "One" selected
    const text = getByRole("combobox");
    expect(text).toHaveValue("One");
    // When we select the 3rd option
    text.focus();
    input(text, "");
    click(getByRole("option", { name: "Three" }));
    // Then onSelect was called
    expect(onSelect).toHaveBeenCalledWith("3");
  });

  function TestSelectField<O, V extends Value>(props: Omit<SelectFieldProps<O, V>, "onSelect">): JSX.Element {
    const [selected, setSelected] = useState<V | undefined>(props.value);
    return (
      <SelectField<O, V>
        {...props}
        value={selected}
        onSelect={(value) => {
          onSelect(value);
          setSelected(value);
        }}
      />
    );
  }
});
