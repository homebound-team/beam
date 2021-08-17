import { MultiSelectField as MockMultiSelectField } from "./MultiSelectField.mock";
import { render, select } from "src/utils/rtl";

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
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        values={values}
        onSelect={onSelect}
        options={options}
      />,
    );
    // When we select the 3rd option as well
    select(r.select, ["thr"]);
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
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        values={values}
        onSelect={onSelect}
        options={options}
      />,
    );
    // When we select the 1st and 3rd options and deselect the 2nd option
    select(r.select, ["one", "two", "thr"]);
    // Then onSelect was called with 1 and 3
    expect(onSelect).toHaveBeenCalledWith(
      ["1", "3"],
      [
        { id: "1", name: "one" },
        { id: "3", name: "thr" },
      ],
    );
  });
});
