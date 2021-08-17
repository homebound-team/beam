import { SelectField as MockSelectField } from "./SelectField.mock";
import { render, select } from "src/utils/rtl";

describe("MockSelectField", () => {
  it("fires onSelect when selecting an inital option", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
    ];
    const onSelect = jest.fn();
    const r = await render(
      <MockSelectField
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        value={""}
        onSelect={onSelect}
        options={options}
      />,
    );
    // When we select the 2nd option
    select(r.select, "two");
    // Then onSelect was called with 2
    expect(onSelect).toHaveBeenCalledWith("2", {"id": "2", "name": "two"});
  });

  it("fires onSelect when selecting a different option", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
    ];
    // Given the 2nd option is already selected
    const value = "2";
    const onSelect = jest.fn();
    const r = await render(
      <MockSelectField
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        value={value}
        onSelect={onSelect}
        options={options}
      />,
    );
    // When we select the 3rd option
    select(r.select, ["thr"]);
    // Then onSelect was called with 3
    expect(onSelect).toHaveBeenCalledWith("3", {"id": "3", "name": "thr"});
  });
});
