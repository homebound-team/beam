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
    const { getByRole, age } = await render(
      <TestSelectField
        label="Age"
        value={"1"}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // That initially has "One" selected
    expect(age()).toHaveValue("One");
    // When we select the 3rd option
    fireEvent.focus(age());
    input(age(), "");
    click(getByRole("option", { name: "Three" }));
    // Then onSelect was called
    expect(onSelect).toHaveBeenCalledWith("3");
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
  });

  it("resets input value on blur if it does not match the selected option", async () => {
    // Given a Select Field with a selected option
    const r = await render(
      <TestSelectField
        label="Age"
        value={"1"}
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        data-testid="age"
      />,
    );
    // When changing the inputs value to no longer match the selected option
    input(r.age(), "asdf");
    // And `blur`ing the field
    fireEvent.blur(r.age());
    // Then expect the value to be reset to the selected option
    expect(r.age()).toHaveValue("One");
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
