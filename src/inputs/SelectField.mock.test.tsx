import { render, select } from "src/utils/rtl";
import { SelectField as MockSelectField } from "./SelectField.mock";

describe("MockSelectField", () => {
  it("fires onSelect when selecting an initial option", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
    ];
    const onSelect = jest.fn();
    const r = await render(
      <MockSelectField
        label="test"
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
    expect(onSelect).toHaveBeenCalledWith("2", { id: "2", name: "two" });
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
        label="test"
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
    expect(onSelect).toHaveBeenCalledWith("3", { id: "3", name: "thr" });
  });

  it("disables options that match disabledOptions", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
      { id: "4", name: "four" },
    ];
    const value = "1";
    const onSelect = jest.fn();
    // When disabledOptions are provided
    const r = await render(
      <MockSelectField
        label="test"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        value={value}
        onSelect={onSelect}
        options={options}
        disabledOptions={["2", "3"]}
      />,
    );
    // Then matching options are disabled
    expect(r.getByText("two")).toBeDisabled();
    expect(r.getByText("thr")).toBeDisabled();
  });
});
