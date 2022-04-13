import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { Value } from "src/inputs/Value";
import { noop } from "src/utils";
import { click, render, select, wait } from "src/utils/rtl";
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
    select(r.test, "two");
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
    select(r.test, ["thr"]);
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
    // and unmatching options are not disabled
    expect(r.getByText("one")).not.toBeDisabled();
    expect(r.getByText("four")).not.toBeDisabled();
  });

  it("can load options via options prop callback", async () => {
    const options = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "thr" },
    ];
    // Given a Select Field with options that are loaded via a callback
    const r = await render(
      <MockSelectField
        label="Age"
        value="1"
        options={{ initial: [options[0]], load: async () => ({ options }) }}
        onSelect={noop}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
      />,
    );
    // When opening the menu
    fireEvent.focus(r.age());
    // Then expect to see the initial option - (should have length of 2 as the mock provides an blank options)
    expect(r.getAllByRole("option")).toHaveLength(2);
    // And when waiting for the promise to resolve
    await wait();
    // Then expect the rest of the options to be loaded in
    expect(r.getAllByRole("option")).toHaveLength(4);
  });

  it("reflects new options when prop changes", async () => {
    // Given a Select Field with options that are loaded via a callback
    const r = await render(<TestUpdateOptionsField />);
    // Initially expect to see the initial option - (should have length of 2 as the mock provides an blank options)
    expect(r.getAllByRole("option")).toHaveLength(2);
    // When updating the options prop
    click(r.updateOptions);
    // Then expect the rest of the options to be loaded in
    expect(r.getAllByRole("option")).toHaveLength(4);
  });
});

function TestUpdateOptionsField<O, V extends Value>() {
  const options = [
    { id: "1", name: "one" },
    { id: "2", name: "two" },
    { id: "3", name: "thr" },
  ];
  const [initOptions, setOptions] = useState([options[0]]);
  return (
    <>
      <MockSelectField
        label="Age"
        value="1"
        options={initOptions}
        onSelect={noop}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
      />
      ,
      <button data-testid="updateOptions" onClick={() => setOptions(options as any)} />
    </>
  );
}
