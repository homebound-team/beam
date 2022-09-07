import { click, render, select } from "src/utils/rtl";
import { fireEvent } from "@testing-library/react";
import { MultiSelectField as MockMultiSelectField } from "./MultiSelectField.mock";

describe("MockMultiSelectField", () => {
  it("fires onSelect when selecting one additional option", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
    ];
    // Given the 2nd option is already selected
    const values = ["2"];
    const onSelect = jest.fn();
    const r = await render(
      <MockMultiSelectField
        label="test"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        values={values}
        onSelect={onSelect}
        options={options}
      />,
    );
    // When we select the 3rd option as well
    select(r.test, ["thr"]);
    // Then onSelect was called with 2 and 3
    expect(onSelect).toHaveBeenCalledWith(
      ["2", "3"],
      [
        { id: "2", name: "two" },
        { id: "3", name: "thr" },
      ],
    );
  });

  it("fires onSelecting when selecting multiple at the same time", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
    ];
    // Given the 2nd option is already selected
    const values = ["2"];
    const onSelect = jest.fn();
    const r = await render(
      <MockMultiSelectField
        label="test"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        values={values}
        onSelect={onSelect}
        options={options}
      />,
    );
    // When we select the 1st and 3rd options and deselect the 2nd option
    select(r.test, ["one", "two", "thr"]);
    // Then onSelect was called with 1 and 3
    expect(onSelect).toHaveBeenCalledWith(
      ["1", "3"],
      [
        { id: "1", name: "one" },
        { id: "3", name: "thr" },
      ],
    );
  });

  it("can deselect", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
    ];
    // Given the 2nd and 3rd options are already selected
    const values = ["2", "3"];
    const onSelect = jest.fn();
    const r = await render(
      <MockMultiSelectField
        label="test"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        values={values}
        onSelect={onSelect}
        options={options}
      />,
    );
    // when deselecting "two"
    select(r.test, ["two"]);
    // Then only "three" is returned
    expect(onSelect).toHaveBeenCalledWith(["3"], [{ id: "3", name: "thr" }]);
  });

  it("disabledOptions show up as disabled", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
    ];
    // Given a select field with no selected values
    const onSelect = jest.fn();
    const { test } = await render(
      <MockMultiSelectField
        label="test"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        values={[]}
        onSelect={onSelect}
        options={options}
        disabledOptions={["2"]}
      />,
    );
    // When opening the menu
    fireEvent.focus(test());
    // Options will be ["", ...options], that's why we select the 2 index
    const optionTwo = test().options[2];
    // Then expect the second option to be disabled
    expect(optionTwo).toBeDisabled()
    // And when clicking on that option
    click(optionTwo);
    // Then the `onSelect` callback is not called
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("shows the helperText if given", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
    ];
    // Given the 2nd and 3rd options are already selected
    const values = ["2", "3"];
    const onSelect = jest.fn();
    const { test_helperText } = await render(
      <MockMultiSelectField
        label="test"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        values={values}
        onSelect={onSelect}
        options={options}
        helperText={"Helper text test"}
      />,
    );
    expect(test_helperText()).toHaveTextContent("Helper text test");
  })
});
