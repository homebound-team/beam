import { click, input, render } from "@homebound/rtl-utils";
import { useState } from "react";
import { idAndName2, SelectField, SelectFieldProps, Value } from "src/inputs";

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
      <TestSelectField label="Age" value={"1" as string} options={options} mapOption={idAndName2} />,
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

  function TestSelectField<O, V extends Value, V2 extends Value>(
    props: Omit<SelectFieldProps<O, V, V2>, "onSelect">,
  ): JSX.Element {
    const [selected, setSelected] = useState<V2 | undefined>(props.value);
    return (
      <SelectField<O, V, V2>
        {...(props as any)}
        value={selected}
        onSelect={(value) => {
          onSelect(value);
          setSelected(value);
        }}
      />
    );
  }
});
