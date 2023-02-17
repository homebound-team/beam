import { Autocomplete } from "src/inputs/Autocomplete";
import { HasIdAndName } from "src/types";
import { click, focus, render, type } from "src/utils/rtl";

describe("Autocomplete", () => {
  it("renders", async () => {
    const options: HasIdAndName[] = [
      { id: "u:1", name: "User 1" },
      { id: "u:2", name: "User 2" },
    ];
    // Given an Autocomplete
    const r = await render(
      <Autocomplete<HasIdAndName>
        label="Search"
        options={options}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        value={"Test"}
        onInputChange={() => {}}
        placeholder="Search placeholder..."
        onSelect={() => {}}
      />,
    );

    // Then it should render the static content
    expect(r.search_label()).toHaveTextContent("Search");
    expect(r.search()).toHaveAttribute("placeholder", "Search placeholder...");
    expect(r.search()).toHaveValue("Test");
    // And it should not render the menu
    expect(r.queryByRole("listbox")).toBeFalsy();

    // When the input is focused
    focus(r.search);
    // Then the options are displayed and have the correct text
    expect(r.getAllByRole("option")[0]).toHaveTextContent("User 1");
    expect(r.getAllByRole("option")[1]).toHaveTextContent("User 2");
  });

  it("can fire onChange and onSelect callbacks", async () => {
    const options: HasIdAndName[] = [{ id: "u:1", name: "User 1" }];
    const onChange = jest.fn();
    const onSelect = jest.fn();
    const r = await render(
      <Autocomplete
        label="Search"
        onSelect={onSelect}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        onInputChange={onChange}
        value={undefined}
        options={options}
      />,
    );
    // When typing in the input
    type(r.search, "User 1");
    // Then the onChange callback should be fired
    expect(onChange).toHaveBeenCalledWith("User 1");

    // And when focusing the input to open the menu
    focus(r.search);
    // and clicking on the option
    click(r.getByRole("option"));
    // Then the onSelect callback should be fired
    expect(onSelect).toHaveBeenCalledWith(options[0]);
  });

  it("can be disabled", async () => {
    const r = await render(
      <Autocomplete
        label="Search"
        onSelect={() => {}}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        onInputChange={() => {}}
        value={undefined}
        options={[{ id: "u:1", name: "User 1" }]}
        disabled={true}
      />,
    );
    // Then the input should be disabled
    expect(r.search()).toBeDisabled();
    // And when the input is focused
    focus(r.search);
    // Then the menu should not be displayed
    expect(r.queryByRole("listbox")).toBeFalsy();
  });

  it("can be cleared", async () => {
    const onChange = jest.fn();
    const r = await render(
      <Autocomplete
        label="Search"
        onSelect={() => {}}
        getOptionLabel={(o) => o.name}
        getOptionValue={(o) => o.id}
        onInputChange={onChange}
        value="Test"
        options={[{ id: "u:1", name: "User 1" }]}
      />,
    );
    // When the input is focused
    focus(r.search);
    // And the clear button is clicked
    click(r.xCircle);
    // Then the input should be cleared
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
