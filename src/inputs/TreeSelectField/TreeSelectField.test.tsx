import { fireEvent } from "@testing-library/react";
import { TreeSelectField } from "src/inputs";
import { NestedOption } from "src/inputs/TreeSelectField/utils";
import { HasIdAndName } from "src/types";
import { noop } from "src/utils";
import { blur, click, focus, getSelected, render, wait } from "src/utils/rtl";
import { useState } from "react";

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
    expect(r.favoriteLeague).toHaveAttribute("placeholder", "Select a sport");
    expect(r.favoriteLeague_label).toHaveTextContent("Favorite League");
    expect(r.favoriteLeague_helperText).toHaveTextContent("Choose any league you like.");
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
    expect(r.favoriteLeague).toBeDisabled();
    // And the expand/collapse button should be disabled.
    expect(r.toggleListBox).toBeDisabled();
  });

  it("doesn't select disabled options when the parent is selected", async () => {
    // Given a TreeSelect field with no options select, and a disabled option
    const onSelect = jest.fn();
    const r = await render(
      <TreeSelectField
        onSelect={onSelect}
        options={getNestedOptions()}
        disabledOptions={["nba"]}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );

    // When selecting the Basketball option
    click(r.favoriteLeague);
    click(r.getByRole("option", { name: "Basketball" }));

    // Then only the WNBA option is selected
    expect(onSelect.mock.calls[0][0].leaf.values).toEqual(["wnba"]);
  });

  it("doesn't deselect disabled options when the parent is deselected", async () => {
    // Given a TreeSelect field with all basketball options select, and a "NBA" is disabled
    const onSelect = jest.fn();
    const r = await render(
      <TreeSelectField
        onSelect={onSelect}
        options={getNestedOptions()}
        disabledOptions={["nba"]}
        label="Favorite League"
        values={["nba", "wnba"]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );

    // When de-selecting the Basketball option
    click(r.favoriteLeague);
    click(r.getByRole("option", { name: "Basketball" }));

    // Then only the WNBA option is de-selected
    expect(onSelect.mock.calls[0][0].leaf.values).toEqual(["nba"]);
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
    expect(r.favoriteLeague).toHaveTextContent("One");
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
        options={{ current: initialOption, load: async () => ({ options }) }}
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
    expect(r.loadingDots).toBeTruthy();
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
    expect(r.selectedOptionsCount).toHaveTextContent("2");
    expect(r.favoriteLeague).toHaveValue("");

    // When opening the options
    click(r.favoriteLeague);
    // Then the selected options are checked
    expect(r.getByRole("option", { name: "NBA" })).toHaveAttribute("aria-selected", "true");
    expect(r.getByRole("option", { name: "NFL" })).toHaveAttribute("aria-selected", "true");
    // And the parent options checkboxes are in the indeterminate state
    expect(r.treeOption_basketball_checkbox).toHaveAttribute("data-checked", "mixed");
    expect(r.treeOption_football_checkbox).toHaveAttribute("data-checked", "mixed");
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
    expect(r.query.selectedOptionsCount).not.toBeInTheDocument();
    expect(r.favoriteLeague).toHaveValue("NBA");

    // When opening the options
    click(r.favoriteLeague);
    // Then the selected options are checked
    expect(r.getByRole("option", { name: "NBA" })).toHaveAttribute("aria-selected", "true");
    // And the parent option's checkbox is in the indeterminate state
    expect(r.treeOption_basketball_checkbox).toHaveAttribute("data-checked", "mixed");
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
    expect(r.treeOption_collapseToggle_baseball.firstChild).toHaveAttribute("data-icon", "triangleDown");
    // When collapsing the parent option
    click(r.treeOption_collapseToggle_baseball);
    // Then the child options are no longer visible
    expect(r.queryByRole("option", { name: "MLB" })).toBeFalsy();
    // And the expand/collapse button has the correct icon
    expect(r.treeOption_collapseToggle_baseball.firstChild).toHaveAttribute("data-icon", "triangleRight");

    // When expanding the parent option
    click(r.treeOption_collapseToggle_baseball);
    // Then the child options are visible
    expect(r.getByRole("option", { name: "MLB" })).toBeVisible();
    // And the expand/collapse button has the correct icon again
    expect(r.treeOption_collapseToggle_baseball.firstChild).toHaveAttribute("data-icon", "triangleDown");
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
    click(r.treeOption_basketball_checkbox);
    // Then all children are selected
    expect(r.getByRole("option", { name: "NBA" })).toHaveAttribute("aria-selected", "true");
    expect(r.getByRole("option", { name: "WNBA" })).toHaveAttribute("aria-selected", "true");
    // And the parent option's checkbox is in the checked state
    expect(r.treeOption_basketball_checkbox).toHaveAttribute("data-checked", "true");

    // When deselecting the parent option
    click(r.treeOption_basketball_checkbox);
    // Then all children are deselected
    expect(r.getByRole("option", { name: "NBA" })).toHaveAttribute("aria-selected", "false");
    expect(r.getByRole("option", { name: "WNBA" })).toHaveAttribute("aria-selected", "false");
    // And the parent option's checkbox is in the unchecked state
    expect(r.treeOption_basketball_checkbox).toHaveAttribute("data-checked", "false");
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
    fireEvent.input(r.favoriteLeague, { target: { value: "nba" } });
    expect(r.favoriteLeague).toHaveValue("nba");
    // Then only the NBA option is visible
    expect(r.queryAllByRole("option")).toHaveLength(2);
    expect(r.getByRole("option", { name: "NBA" })).toBeVisible();
    expect(r.getByRole("option", { name: "WNBA" })).toBeVisible();
  });

  it("shows the correct input text when selecting options", async () => {
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
    // When selecting a single option
    click(r.favoriteLeague);
    click(r.getByRole("option", { name: "NBA" }));
    // Then the input value remains empty to allow the user to type to filter
    expect(r.favoriteLeague).toHaveValue("");
    // When blur-ing the field
    blur(r.favoriteLeague);
    // Then the input text is the selected option's label
    expect(r.favoriteLeague).toHaveValue("NBA");
    // When selecting multiple options
    click(r.favoriteLeague);
    // Then the input value is emptied to allow the user to immediately start typing to filter
    expect(r.favoriteLeague).toHaveValue("");
    expect(r.favoriteLeague).toHaveFocus();
    click(r.getByRole("option", { name: "NFL" }));
    // And the count of selected options is shown
    expect(r.selectedOptionsCount).toHaveTextContent("2");
  });

  it("supports nothingSelectedText", async () => {
    // Given a TreeSelectField with the 'nothingSelectedText' defined
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        nothingSelectedText="Select a league"
      />,
    );
    // Then the input text is the 'nothingSelectedText'
    expect(r.favoriteLeague).toHaveValue("Select a league");
    // When opening the menu
    click(r.favoriteLeague);
    // Then the input value is emptied to allow the user to immediately start typing to filter
    expect(r.favoriteLeague).toHaveValue("");
    // When blurring back out of the field
    blur(r.favoriteLeague);
    // Then the input text is the 'nothingSelectedText'
    expect(r.favoriteLeague).toHaveValue("Select a league");
  });

  it("does not auto-select parent if 'children' is an empty array", async () => {
    // When rendering the TreeSelectField with a parent defined without any children and no values selected
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={[
          {
            id: "baseball",
            name: "Baseball",
            children: [],
          },
        ]}
        label="Favorite League"
        values={[]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // Then the parent option is not selected
    expect(r.favoriteLeague).toHaveValue("");
    click(r.favoriteLeague);
    expect(r.getByRole("option", { name: "Baseball" })).toHaveAttribute("aria-selected", "false");
  });

  it("shows the number of top-level options selected", async () => {
    // Given a TreeSelectField with nested options
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        options={getNestedOptions()}
        label="Favorite League"
        values={["nba", "nfl", "xfl"]}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // As all the options for "Football" are selected it should only count as one option selected
    expect(r.selectedOptionsCount).toHaveTextContent("2");
  });

  it("can disable options", async () => {
    // Given a TreeSelectField with disabled options
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        values={[]}
        options={getNestedOptions()}
        disabledOptions={["nba"]}
        label="Favorite League"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // When opening the options
    click(r.favoriteLeague);
    // Then the disabled option is disabled
    expect(r.getByRole("option", { name: "NBA" })).toHaveAttribute("aria-disabled", "true");
  });

  it("selects all matching options when there are duplicates and only the child is passed as values", async () => {
    // Given the multiple parents with duplicate children
    const options: NestedOption<HasIdAndName>[] = [
      { id: "p:1", name: "Parent 1", children: [{ id: "c:1", name: "Child 1" }] },
      { id: "p:2", name: "Parent 2", children: [{ id: "c:1", name: "Child 1" }] },
    ];
    // And the TreeSelectField with just the one child set as the value.
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        values={["c:1"]}
        options={options}
        label="Favorite League"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );

    // When we open the menu
    click(r.favoriteLeague);
    // Then all matching options are selected
    expect(r.getAllByRole("option", { name: "Child 1" })[0]).toHaveAttribute("aria-selected", "true");
    expect(r.getAllByRole("option", { name: "Child 1" })[1]).toHaveAttribute("aria-selected", "true");
  });

  it("selects all matching options when there are duplicates and only the parent is passed as the value", async () => {
    // Given the multiple parents with duplicate children
    const options: NestedOption<HasIdAndName>[] = [
      { id: "p:1", name: "Parent 1", children: [{ id: "c:1", name: "Child 1" }] },
      { id: "p:2", name: "Parent 2", children: [{ id: "c:1", name: "Child 1" }] },
    ];
    // And the TreeSelectField with just the one child set as the value.
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        values={["p:1"]}
        options={options}
        label="Favorite League"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );

    // When we open the menu
    click(r.favoriteLeague);
    // Then all matching options are selected
    expect(r.getAllByRole("option", { name: "Child 1" })[0]).toHaveAttribute("aria-selected", "true");
    expect(r.getAllByRole("option", { name: "Child 1" })[1]).toHaveAttribute("aria-selected", "true");
  });

  it("returns a deduped list when selecting duplicate options", async () => {
    // Given the multiple parents with duplicate children
    const options: NestedOption<HasIdAndName>[] = [
      { id: "p:1", name: "Parent 1", children: [{ id: "c:1", name: "Child 1" }] },
      { id: "p:2", name: "Parent 2", children: [{ id: "c:1", name: "Child 1" }] },
    ];
    // With a mocked onSelect
    const onSelect = jest.fn();
    // And the TreeSelectField
    const r = await render(
      <TreeSelectField
        onSelect={onSelect}
        values={[]}
        options={options}
        label="Favorite League"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );

    // When we open the menu
    click(r.favoriteLeague);
    // And selecting the first child
    click(r.getAllByRole("option", { name: "Child 1" })[0]);

    // Then all matching options are selected
    expect(r.getAllByRole("option", { name: "Child 1" })[0]).toHaveAttribute("aria-selected", "true");
    expect(r.getAllByRole("option", { name: "Child 1" })[1]).toHaveAttribute("aria-selected", "true");

    // And only the one child option is returned along with both parents
    expect(onSelect.mock.calls[0][0].all.values).toEqual(["c:1", "p:2", "p:1"]);
    expect(onSelect.mock.calls[0][0].leaf.values).toEqual(["c:1"]);
    expect(onSelect.mock.calls[0][0].root.values).toEqual(["p:1", "p:2"]);
  });

  it("respects chipDisplay for 'root' (default)", async () => {
    // Given the TreeSelectField with top level options selected and no chipDisplay set
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        values={["baseball", "basketball"]}
        options={getNestedOptions()}
        label="Favorite League"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );

    // Then the selected options display only Baseball and Basketball
    expect(r.selectedOptionsCount).toHaveTextContent("2");
    expect(r.favoriteLeague_unfocusedPlaceholderContainer).toHaveTextContent("BaseballBasketball");
  });

  it("respects chipDisplay for 'leaf'", async () => {
    // Given the TreeSelectField with top level options selected and chipDisplay of 'leaf'
    const r = await render(
      <TreeSelectField
        chipDisplay="leaf"
        onSelect={noop}
        values={["baseball", "basketball"]}
        options={getNestedOptions()}
        label="Favorite League"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );

    // Then the selected options display as (both baseball and basketball leagues).
    expect(r.selectedOptionsCount).toHaveTextContent("4");
    expect(r.favoriteLeague_unfocusedPlaceholderContainer).toHaveTextContent("MLBMinor League BaseballNBAWNBA");
  });

  it("respects chipDisplay for 'all'", async () => {
    // Given the TreeSelectField with top level options selected and chipDisplay of 'all'
    const r = await render(
      <TreeSelectField
        chipDisplay="all"
        onSelect={noop}
        values={["baseball", "basketball"]}
        options={getNestedOptions()}
        label="Favorite League"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );

    // Then the selected options displays all
    expect(r.selectedOptionsCount).toHaveTextContent("6");
    expect(r.favoriteLeague_unfocusedPlaceholderContainer).toHaveTextContent(
      "BaseballMLBMinor League BaseballBasketballNBAWNBA",
    );
  });

  it("updates values when the caller modifies them", async () => {
    // Given a stateful component that has initial values set, and a button to clear the options
    function Test() {
      const [values, setValues] = useState<string[]>(["baseball", "basketball"]);
      return (
        <>
          <button data-testid="update" onClick={() => setValues(["baseball"])} />
          <TreeSelectField
            onSelect={({ all }) => setValues(all.values)}
            values={values}
            options={getNestedOptions()}
            label="Favorite League"
            getOptionValue={(o) => o.id}
            getOptionLabel={(o) => o.name}
          />
        </>
      );
    }
    const r = await render(<Test />);

    // Then the options are initially selected
    expect(r.selectedOptionsCount).toHaveTextContent("2");

    // When clicking the update button to remove Basketball from the values
    click(r.update);

    // Then the only remaining option is Baseball
    expect(r.selectedOptionsCount).toHaveTextContent("1");
    expect(r.favoriteLeague_unfocusedPlaceholderContainer).toHaveTextContent("Baseball");
  });

  it("can reset values to undefined", async () => {
    // Given a TreeSelectField with values set
    const r = await render(
      <TreeSelectField
        onSelect={noop}
        values={["nba", "mlb"]}
        options={getNestedOptions()}
        label="Favorite League"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );
    // Then the options are initially selected
    expect(getSelected(r.favoriteLeague)).toEqual(["MLB", "NBA"]);

    // When we re-render with values set to undefined (simulating an outside component's "clear" action, i.e. Filters)
    r.rerender(
      <TreeSelectField
        chipDisplay="all"
        onSelect={noop}
        values={undefined}
        options={getNestedOptions()}
        label="Favorite League"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />,
    );

    // Then the values are reset
    expect(getSelected(r.favoriteLeague)).toEqual(undefined);
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
