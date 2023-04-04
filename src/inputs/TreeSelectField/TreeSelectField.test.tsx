import { fireEvent } from "@testing-library/react";
import { TreeSelectField } from "src/inputs";
import { NestedOption } from "src/inputs/TreeSelectField/utils";
import { HasIdAndName } from "src/types";
import { noop } from "src/utils";
import { blur, click, focus, render, wait } from "src/utils/rtl";

describe(TreeSelectField, () => {
  it("renders", async () => {
    // Given a TreeSelectField
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={[{ id: "1", name: "One" }]}
        label="Favorite League"
        placeholder="Select a sport"
        helperText="Choose any league you like."
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // Then it renders based on the props.
    expect(r.favoriteLeague()).toHaveAttribute("placeholder", "Select a sport");
    expect(r.favoriteLeague_label()).toHaveTextContent("Favorite League");
    expect(r.favoriteLeague_helperText()).toHaveTextContent("Choose any league you like.");
  });

  it("renders disabled", async () => {
    // Given a disabled TreeSelectField
    const r = await render(
      <TreeSelectField
        disabled
        onSelect={noop}
        options={[{ id: "1", name: "One" }]}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // Then it should be disabled.
    expect(r.favoriteLeague()).toBeDisabled();
    // And the expand/collapse button should be disabled.
    expect(r.toggleListBox()).toBeDisabled();
  });

  it("renders readonly", async () => {
    // Given a readonly TreeSelectField
    const r = await render(
      <TreeSelectField
        readOnly
        onSelect={noop}
        options={[{ id: "1", name: "One" }]}
        label="Favorite League"
        values={["1"]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // Then it should render as just text (no longer an input)
    expect(r.favoriteLeague()).toHaveTextContent("One");
  });

  it("triggers onBlur and onFocus callbacks", async () => {
    // Given a TreeSelectField with `onFocus` and `onBlur` callbacks
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
      <TreeSelectField
        onBlur={onBlur}
        onFocus={onFocus}
        onSelect={noop}
        options={[{ id: "1", name: "One" }]}
        label="Favorite League"
        values={["1"]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // When the input is focused
    focus(r.favoriteLeague);
    // Then the `onFocus` callback should be called
    expect(onFocus).toHaveBeenCalledTimes(1);
    // When the input is blurred
    blur(r.favoriteLeague);
    // Then the `onBlur` callback should be called
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("can select options", async () => {
    // Given a TreeSelectField
    const onSelect = jest.fn();
    const r = await render(
      <TreeSelectField
        onSelect={onSelect}
        options={getNestedOptions()}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // When selecting a single "leaf" option (no children)
    click(r.favoriteLeague);
    click(r.getByRole("option", { name: "NBA" }));
    click(r.getByRole("option", { name: "NBA" }));
    // Then only that option is selected
    const basketballOption = getNestedOptions().find((o) => o.id === "basketball");
    const nbaOption = basketballOption!.children!.find((o) => o.id === "nba");
    expect(onSelect).toHaveBeenCalledWith({
      all: { values: ["nba"], options: [nbaOption] },
      leaf: { values: ["nba"], options: [nbaOption] },
      root: { values: ["nba"], options: [nbaOption] },
    });

    // When selecting a single "parent" option (has children)
    click(r.getByRole("option", { name: "Basketball" }));
    // Then all children are selected
    const wnbaOption = basketballOption!.children!.find((o) => o.id === "wnba");
    expect(onSelect).toHaveBeenCalledWith({
      all: { values: ["basketball", "nba", "wnba"], options: [basketballOption, ...basketballOption!.children!] },
      leaf: { values: ["nba", "wnba"], options: [nbaOption, wnbaOption] },
      root: { values: ["basketball"], options: [basketballOption] },
    });
  });

  it("renders with options to be loaded async", async () => {
    // Given a TreeSelectField with options to be loaded via a callback
    const options = getNestedOptions();
    const initialOption: NestedOption<HasIdAndName>[] = [options[0]];
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={{ initial: initialOption, load: async () => ({ options }) }}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // When opening the options
    click(r.favoriteLeague);
    // Then the initial option(s) is visible
    expect(r.getAllByRole("option")).toHaveLength(3);
    expect(r.loadingDots()).toBeTruthy();
    // And when waiting for the promise to resolve
    await wait();

    // Then expect the rest of the options to be loaded in and the loading state to be removed
    expect(r.getAllByRole("option")).toHaveLength(9);
    expect(r.queryByTestId("loadingDots")).toBeFalsy();
  });

  it("renders with multiple options selected", async () => {
    // Given a TreeSelectField with a nested options and multiple options selected
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={["nba", "nfl"]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // Then the selected options are visible
    expect(r.selectedOptionsCount()).toHaveTextContent("2");
    expect(r.favoriteLeague()).toHaveValue("");

    // When opening the options
    click(r.favoriteLeague);
    // Then the selected options are checked
    expect(r.getByRole("option", { name: "NBA" })).toHaveAttribute("aria-selected", "true");
    expect(r.getByRole("option", { name: "NFL" })).toHaveAttribute("aria-selected", "true");
    // And the parent options checkboxes are in the indeterminate state
    expect(r.treeOption_basketball_checkbox()).toHaveAttribute("data-checked", "mixed");
    expect(r.treeOption_football_checkbox()).toHaveAttribute("data-checked", "mixed");
  });

  it("renders with one option selected", async () => {
    // Given a TreeSelectField with a nested options and a single option selected
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={["nba"]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // Then the selected options are visible
    expect(r.selectedOptionsCount).toNotBeInTheDom();
    expect(r.favoriteLeague()).toHaveValue("NBA");

    // When opening the options
    click(r.favoriteLeague);
    // Then the selected options are checked
    expect(r.getByRole("option", { name: "NBA" })).toHaveAttribute("aria-selected", "true");
    // And the parent option's checkbox is in the indeterminate state
    expect(r.treeOption_basketball_checkbox()).toHaveAttribute("data-checked", "mixed");
  });

  it("can collapse and expand options", async () => {
    // Given a TreeSelectField with nested options
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // When opening the options
    click(r.favoriteLeague);
    // Then the child options are visible
    expect(r.getByRole("option", { name: "MLB" })).toBeVisible();
    // And the expand/collapse button has the correct icon
    expect(r.treeOption_collapseToggle_baseball().firstChild).toHaveAttribute("data-icon", "triangleDown");
    // When collapsing the parent option
    click(r.treeOption_collapseToggle_baseball);
    // Then the child options are no longer visible
    expect(r.queryByRole("option", { name: "MLB" })).toBeFalsy();
    // And the expand/collapse button has the correct icon
    expect(r.treeOption_collapseToggle_baseball().firstChild).toHaveAttribute("data-icon", "triangleRight");

    // When expanding the parent option
    click(r.treeOption_collapseToggle_baseball);
    // Then the child options are visible
    expect(r.getByRole("option", { name: "MLB" })).toBeVisible();
    // And the expand/collapse button has the correct icon again
    expect(r.treeOption_collapseToggle_baseball().firstChild).toHaveAttribute("data-icon", "triangleDown");
  });

  it("can initially render with all options initially collapsed", async () => {
    // Given a TreeSelectField with nested options
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        defaultCollapsed
      />,
    );
    // When opening the options
    click(r.favoriteLeague);
    // Then all top level options are collapsed
    expect(r.queryAllByRole("option")).toHaveLength(3);
  });

  it("correctly selects all children if only a parent was passed as a selected value", async () => {
    // Given a TreeSelectField with nested options
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={["baseball"]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // When opening the options
    click(r.favoriteLeague);
    // Then all children are selected
    expect(r.getByRole("option", { name: "MLB" })).toHaveAttribute("aria-selected", "true");
    expect(r.getByRole("option", { name: "Minor League Baseball" })).toHaveAttribute("aria-selected", "true");
  });

  it("correctly selects the parent if all children were passed as selected values", async () => {
    // Given a TreeSelectField with nested options
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={["mlb", "milb"]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // When opening the options
    click(r.favoriteLeague);
    // Then the parent is selected
    expect(r.getByRole("option", { name: "Baseball" })).toHaveAttribute("aria-selected", "true");
  });

  it("selects and deselects all children based on parent selection", async () => {
    // Given a TreeSelectField with nested options
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // When opening the options
    click(r.favoriteLeague);
    // And selecting the parent option
    click(r.treeOption_basketball_checkbox());
    // Then all children are selected
    expect(r.getByRole("option", { name: "NBA" })).toHaveAttribute("aria-selected", "true");
    expect(r.getByRole("option", { name: "WNBA" })).toHaveAttribute("aria-selected", "true");
    // And the parent option's checkbox is in the checked state
    expect(r.treeOption_basketball_checkbox()).toHaveAttribute("data-checked", "true");

    // When deselecting the parent option
    click(r.treeOption_basketball_checkbox());
    // Then all children are deselected
    expect(r.getByRole("option", { name: "NBA" })).toHaveAttribute("aria-selected", "false");
    expect(r.getByRole("option", { name: "WNBA" })).toHaveAttribute("aria-selected", "false");
    // And the parent option's checkbox is in the unchecked state
    expect(r.treeOption_basketball_checkbox()).toHaveAttribute("data-checked", "false");
  });

  it("can filter options", async () => {
    // Given a TreeSelectField with nested options
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // When opening the options
    click(r.favoriteLeague);
    // Then all options are visible
    expect(r.queryAllByRole("option")).toHaveLength(9);
    // And typing in the filter input
    fireEvent.input(r.favoriteLeague(), { target: { value: "nba" } });
    expect(r.favoriteLeague()).toHaveValue("nba");
    // Then only the NBA option is visible
    expect(r.queryAllByRole("option")).toHaveLength(2);
    expect(r.getByRole("option", { name: "NBA" })).toBeVisible();
    expect(r.getByRole("option", { name: "WNBA" })).toBeVisible();
  });
});

function getNestedOptions(): NestedOption<HasIdAndName>[] {
  return [
    {
      id: "baseball",
      name: "Baseball",
      children: [
        { id: "mlb", name: "MLB" },
        { id: "milb", name: "Minor League Baseball" },
      ],
    },
    {
      id: "basketball",
      name: "Basketball",
      children: [
        { id: "nba", name: "NBA" },
        { id: "wnba", name: "WNBA" },
      ],
    },
    {
      id: "football",
      name: "Football",
      children: [
        { id: "nfl", name: "NFL" },
        { id: "xfl", name: "XFL" },
      ],
    },
  ];
}
