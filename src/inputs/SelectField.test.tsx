import { click, input, render } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { SelectField, SelectFieldProps, Value } from "src/inputs";

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
      <TestSelectField
        label="Age"
        value={"1"}
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
    expect(onSelect).toHaveBeenCalledWith("3");
  });

  it("does not fire focus/blur when readOnly", async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
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
    fireEvent.focus(r.age());
    fireEvent.blur(r.age());
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocus).not.toHaveBeenCalled();
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
