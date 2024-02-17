import { click, render } from "@homebound/rtl-utils";
import { useState } from "react";
import { MultiLineSelectField, MultiLineSelectFieldProps } from "src/inputs";
import { HasIdAndName, Optional } from "src/types";

const options = [
  { id: "1", name: "Project one" },
  { id: "2", name: "Project two" },
  { id: "3", name: "Project three" },
];

describe("MultiLineSelectField", () => {
  const onSelect = jest.fn();

  it("has an empty select field by default", async () => {
    // Given a MultiLineSelectField with no selected values
    // When the component is rendered
    const r = await render(<TestMultiLineSelectField values={[]} options={options} />);

    // Then it doesn't have a value set
    expect(r.selectField).toHaveValue("");

    // And the "add another" button is disabled
    expect(r.addAnother).toBeDisabled();
  });

  it("can set a second value", async () => {
    // Given a MultiLineSelectField with 1 selected value
    const r = await render(<TestMultiLineSelectField values={["1"]} options={options} />);

    expect(r.selectField_0).toHaveTextContent("Project one");

    // When we select a second option
    click(r.addAnother);
    click(r.selectField_1);
    click(r.getByRole("option", { name: "Project three" }));

    // Then onSelect is called with the correct values
    expect(onSelect).toHaveBeenCalledWith(["1", "3"]);
  });

  it("filters the selected options", async () => {
    // Given a MultiLineSelectField with 1 selected value
    const r = await render(<TestMultiLineSelectField values={["1"]} options={options} />);

    expect(r.selectField_0).toHaveTextContent("Project one");

    // When click to select a new option
    click(r.selectField_1);

    // Then the already selected option doesn't appear on the list
    expect(r.queryByRole("option", { name: "Project one" })).toBeNull();
  });

  it("can delete a selected value", async () => {
    // Given a MultiLineSelectField with 2 selected values
    const r = await render(<TestMultiLineSelectField values={["1", "2"]} options={options} />);

    expect(r.selectField_0).toHaveTextContent("Project one");
    expect(r.selectField_1).toHaveTextContent("Project two");

    // When we deleted the second value
    click(r.deleteSelected_1);

    // Then onSelect is called with the correct values
    expect(onSelect).toHaveBeenCalledWith(["1"]);
  });

  function TestMultiLineSelectField(
    props: Optional<
      MultiLineSelectFieldProps<HasIdAndName<string>, string>,
      "label" | "onSelect" | "getOptionLabel" | "getOptionValue"
    >,
  ): JSX.Element {
    const [selected, setSelected] = useState(props.values);
    return (
      <MultiLineSelectField
        {...props}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        label="Project"
        values={selected}
        onSelect={(values) => {
          onSelect(values);
          setSelected(values);
        }}
      />
    );
  }
});
