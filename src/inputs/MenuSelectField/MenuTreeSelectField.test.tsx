import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { MenuTreeSelectField } from "src/inputs/MenuSelectField/MenuTreeSelectField";
import { optionDomId } from "src/inputs/MenuSelectField/internal/OptionList";
import type { SelectionView, TreeSelectionDisplay } from "src/inputs/MenuSelectField/types";
import type { NestedOption, TreeSelectResponse } from "src/inputs/TreeSelectField/utils";
import type { OptionsOrLoad } from "src/inputs/internal/selectFieldHelpers";
import { click, getOption, getOptions, getSelected, render, select, type } from "src/utils/rtl";
import { vi } from "vitest";

describe("MenuTreeSelectField", () => {
  it("starts with every group collapsed", async () => {
    // Given a tree with nothing selected
    const r = await render(<TreeHarness />);
    // When opening it
    click(r.sports);
    // Then only the roots show
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "Golf"]);
  });

  it("starts with every group open when defaultExpanded", async () => {
    // Given a tree that starts expanded
    const r = await render(<TreeHarness defaultExpanded />);
    // When opening it
    click(r.sports);
    // Then each group's children show
    expect(getOptions(r.sports)).toEqual(["Baseball", "MLB", "MiLB", "Basketball", "NBA", "WNBA", "Golf"]);
    // And a chevron can still collapse its group
    click(r.sports_expand_baseball);
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "NBA", "WNBA", "Golf"]);
  });

  it("expands the groups that hold a selection", async () => {
    // Given a nested option selected
    const r = await render(<TreeHarness initial={["nba"]} />);
    // When opening it
    click(r.sports);
    // Then its group is expanded and partially checked, and other groups stay collapsed
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "NBA", "WNBA", "Golf"]);
    expect(getSelected(r.sports)).toBe("NBA");
    expect(checkboxOf(r.sports, "Basketball")).toHaveAttribute("data-checked", "mixed");
  });

  it("expands the groups that hold a dotted value", async () => {
    // Given some records hold NBA, and nothing is selected
    const r = await render(<TreeHarness mixedValues={["nba"]} />);
    // When opening it
    click(r.sports);
    // Then NBA's group is open and NBA is dotted
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "NBA", "WNBA", "Golf"]);
    expect(getOption(r.sports, "NBA")).toHaveAccessibleDescription("Mixed Selected rows have different values.");
    // And the checkboxes ignore the dot: NBA is unchecked, Basketball isn't partial
    expect(checkboxOf(r.sports, "NBA")).toHaveAttribute("data-checked", "false");
    expect(checkboxOf(r.sports, "Basketball")).toHaveAttribute("data-checked", "false");
  });

  it("does not dot a value its selected parent covers", async () => {
    // Given Basketball selected, and records holding NBA
    const r = await render(<TreeHarness initial={["basketball"]} mixedValues={["nba"]} />);
    // When opening it
    click(r.sports);
    // Then NBA is checked through its parent, so nothing is dotted
    expect(getOption(r.sports, "NBA")).toHaveAttribute("aria-selected", "true");
    expect(getOption(r.sports, "NBA")).not.toHaveAccessibleDescription();
    expect(r.query.sports_mixedLegend).toBeNull();
  });

  it("selects every child when a parent is selected", async () => {
    // Given a tree with nothing selected
    const onSelect = vi.fn();
    const r = await render(<TreeHarness onSelectSpy={onSelect} />);
    // When selecting a parent
    select(r.sports, "Basketball");
    // Then the response covers the parent and its children
    expect(onSelect).toHaveBeenLastCalledWith({
      all: { values: ["basketball", "nba", "wnba"], options: [basketball, nba, wnba] },
      leaf: { values: ["nba", "wnba"], options: [nba, wnba] },
      root: { values: ["basketball"], options: [basketball] },
    });
    // And the badge counts every selected option
    expect(r.sports_count).toHaveTextContent("3");
  });

  it("selects the parent once every child is selected", async () => {
    // Given one child selected
    const onSelect = vi.fn();
    const r = await render(<TreeHarness initial={["nba"]} onSelectSpy={onSelect} />);
    // When selecting its sibling
    select(r.sports, "WNBA");
    // Then the parent is selected too
    expect(onSelect).toHaveBeenLastCalledWith({
      all: { values: ["basketball", "nba", "wnba"], options: [basketball, nba, wnba] },
      leaf: { values: ["nba", "wnba"], options: [nba, wnba] },
      root: { values: ["basketball"], options: [basketball] },
    });
  });

  it("deselects the parent when a child is deselected", async () => {
    // Given a selected parent
    const onSelect = vi.fn();
    const r = await render(<TreeHarness initial={["basketball"]} onSelectSpy={onSelect} />);
    // When deselecting one of its children
    select(r.sports, "NBA");
    // Then only the other child remains
    expect(onSelect).toHaveBeenLastCalledWith({
      all: { values: ["wnba"], options: [wnba] },
      leaf: { values: ["wnba"], options: [wnba] },
      root: { values: ["wnba"], options: [wnba] },
    });
  });

  it("keeps a selected pill when the next options omit that node", async () => {
    // Given a tree
    function Page() {
      const [options, setOptions] = useState(sports());
      const [values, setValues] = useState<string[]>([]);
      return (
        <>
          <button
            data-testid="showBaseball"
            onClick={() => setOptions([{ id: "baseball", name: "Baseball", children: [{ id: "mlb", name: "MLB" }] }])}
          />
          <MenuTreeSelectField
            label="Sports"
            options={options}
            values={values}
            onSelect={(response) => setValues(response.all.values)}
          />
        </>
      );
    }
    const r = await render(<Page />);
    // When Golf is selected and the list is replaced with Baseball
    select(r.sports, "Golf");
    click(r.showBaseball);
    // Then the menu lists Baseball only, and Golf stays a pill
    expect(getOptions(r.sports)).toEqual(["Baseball"]);
    expect(r.sports_selections_pill_0).toHaveTextContent("Golf");
    expect(r.sports_count).toHaveTextContent("1");
  });

  it("removes a child and its parent when that child's pill is clicked", async () => {
    // Given a selected parent, listed as pills for the parent and its children
    const onSelect = vi.fn();
    const r = await render(<TreeHarness initial={["basketball"]} onSelectSpy={onSelect} />);
    click(r.sports);
    // When clicking the NBA pill
    const nba = r.getAllByTestId("sports_selections_pill").find((pill) => pill.textContent === "NBA");
    expect(nba).toBeDefined();
    if (!nba) return;
    click(nba);
    // Then the parent comes off with it, and only WNBA remains
    expect(onSelect).toHaveBeenLastCalledWith({
      all: { values: ["wnba"], options: [wnba] },
      leaf: { values: ["wnba"], options: [wnba] },
      root: { values: ["wnba"], options: [wnba] },
    });
  });

  it("treats a parent value as its whole subtree", async () => {
    // Given only the parent's value on record
    const r = await render(<TreeHarness initial={["basketball"]} />);
    // When opening it
    click(r.sports);
    // Then the parent and its children are all checked
    expect(getSelected(r.sports)).toEqual(["Basketball", "NBA", "WNBA"]);
  });

  it("expands only from the chevron", async () => {
    // Given an open tree
    const onSelect = vi.fn();
    const r = await render(<TreeHarness onSelectSpy={onSelect} />);
    click(r.sports);
    // When clicking the chevron
    click(r.sports_expand_basketball);
    // Then the group expands without selecting anything
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "NBA", "WNBA", "Golf"]);
    expect(r.sports_expand_basketball).toHaveAttribute("aria-expanded", "true");
    expect(onSelect).not.toHaveBeenCalled();
    // And clicking the chevron again collapses it
    click(r.sports_expand_basketball);
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "Golf"]);
  });

  it("selects from the row without expanding it", async () => {
    // Given an open tree
    const r = await render(<TreeHarness />);
    // When selecting a parent row
    select(r.sports, "Baseball");
    // Then the group stays collapsed
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "Golf"]);
    expect(getSelected(r.sports)).toBe("Baseball");
  });

  it("does not render a leaf chevron", async () => {
    // Given an open tree
    const r = await render(<TreeHarness />);
    click(r.sports);
    // Then only groups have a chevron
    expect(r.query.sports_expand_golf).toBeNull();
    expect(r.sports_expand_baseball).toBeInTheDocument();
  });

  it("expands and collapses with the arrow keys", async () => {
    // Given an open tree with Basketball focused
    const r = await render(<TreeHarness />);
    click(r.sports);
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowDown" });
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowDown" });
    expect(activeOption(r.sports_listbox)).toBe(optionDomId(r.sports_listbox.id, 1));
    // When pressing ArrowRight
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowRight" });
    // Then the group expands and focus stays on it
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "NBA", "WNBA", "Golf"]);
    expect(activeOption(r.sports_listbox)).toBe(optionDomId(r.sports_listbox.id, 1));
    // And ArrowRight again steps into the first child, ArrowLeft steps back out
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowRight" });
    expect(activeOption(r.sports_listbox)).toBe(optionDomId(r.sports_listbox.id, 2));
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowLeft" });
    expect(activeOption(r.sports_listbox)).toBe(optionDomId(r.sports_listbox.id, 1));
    // And ArrowLeft on the group collapses it
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowLeft" });
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "Golf"]);
  });

  it("moves focus to the group when collapsing over a focused child", async () => {
    // Given a focused child
    const r = await render(<TreeHarness initial={["nba"]} />);
    click(r.sports);
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowDown" });
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowDown" });
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowDown" });
    expect(activeOption(r.sports_listbox)).toBe(optionDomId(r.sports_listbox.id, 2));
    // When collapsing its group from the chevron
    click(r.sports_expand_basketball);
    // Then focus is on the group
    expect(activeOption(r.sports_listbox)).toBe(optionDomId(r.sports_listbox.id, 1));
  });

  it("shows matches with their ancestors and descendants while searching", async () => {
    // Given a tree long enough to search
    const r = await render(<TreeHarness options={manySports()} />);
    click(r.sports);
    // When searching for a nested option
    type(r.sports_search, "wnba");
    // Then the match shows under its parent
    expect(getOptions(r.sports)).toEqual(["Basketball", "WNBA"]);
    // When searching for a parent
    type(r.sports_search, "basket");
    // Then all of its children show
    expect(getOptions(r.sports)).toEqual(["Basketball", "NBA", "WNBA"]);
    // When clearing the search
    type(r.sports_search, "");
    // Then the groups are collapsed again
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "Football", "Golf", "Hockey"]);
  });

  it("does not cascade into disabled children", async () => {
    // Given a disabled child
    const onSelect = vi.fn();
    const r = await render(<TreeHarness onSelectSpy={onSelect} disabledOptions={["wnba"]} />);
    // When selecting its parent
    select(r.sports, "Basketball");
    // Then the disabled child stays unselected
    expect(onSelect.mock.lastCall?.[0].all.values).toEqual(["basketball", "nba"]);
    expect(onSelect.mock.lastCall?.[0].leaf.values).toEqual(["nba"]);
  });

  it("shows one value under each parent that contains it", async () => {
    // Given the same child under two parents
    const onSelect = vi.fn();
    const r = await render(<TreeHarness options={sharedChild()} onSelectSpy={onSelect} />);
    // When opening it and expanding both groups
    click(r.sports);
    click(r.sports_expand_p1);
    click(r.sports_expand_p2);
    // Then the child is listed twice
    expect(getOptions(r.sports)).toEqual(["Parent 1", "Child 1", "Parent 2", "Child 1"]);
    // When selecting the first copy
    select(r.sports, "Child 1");
    // Then both copies are selected, and the value is returned once
    expect(getSelected(r.sports)).toEqual(["Parent 1", "Child 1", "Parent 2", "Child 1"]);
    expect(onSelect.mock.lastCall?.[0].all.values).toEqual(["p1", "c1", "p2"]);
    expect(onSelect.mock.lastCall?.[0].leaf.values).toEqual(["c1"]);
    expect(onSelect.mock.lastCall?.[0].root.values).toEqual(["p1", "p2"]);
  });

  it("selects every copy when only one parent is the value", async () => {
    // Given one parent selected
    const r = await render(<TreeHarness options={sharedChild()} initial={["p1"]} />);
    // When opening it
    click(r.sports);
    // Then both groups are open and both copies of the child are checked
    expect(getSelected(r.sports)).toEqual(["Parent 1", "Child 1", "Parent 2", "Child 1"]);
  });

  it("names a repeated value once in a proposal", async () => {
    // Given the same child under two parents, and a proposal for its parent
    const r = await render(<TreeHarness options={sharedChild()} initial={["c1"]} proposedValues={["p1"]} />);
    // Then the struck-through original names that child once
    expect(r.sports_originalValue).toHaveTextContent(/^Child 1$/);
  });

  it("does not list a nested current value as its own root", async () => {
    // Given a selected leaf as `current`, and the loaded tree that already contains it
    const r = await render(
      <TreeHarness
        initial={["nba"]}
        options={{
          current: { id: "nba", name: "NBA" },
          load: async () => {},
          options: sports(),
        }}
      />,
    );

    // When the menu opens
    click(r.sports);

    // Then NBA stays under Basketball
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "NBA", "WNBA", "Golf"]);
  });

  it("counts every selection by default", async () => {
    // Given a selected parent and a lone leaf
    const r = await render(<TreeHarness initial={["basketball", "golf"]} />);
    // Then the count badge counts the parent and each selected child
    expect(r.sports_count).toHaveTextContent("4");
  });

  it("counts root selections when asked", async () => {
    // Given a selected parent and a lone leaf, counted by the highest selection
    const r = await render(<TreeHarness initial={["basketball", "golf"]} selectionDisplay="root" />);
    // Then the count badge collapses the parent's children
    expect(r.sports_count).toHaveTextContent("2");
  });

  it("counts leaf selections when asked", async () => {
    // Given a selected parent and a lone leaf, counted by leaf
    const r = await render(<TreeHarness initial={["basketball", "golf"]} selectionDisplay="leaf" />);
    // Then the count badge counts every selected leaf
    expect(r.sports_count).toHaveTextContent("3");
  });

  it("shows every selection as an in-field pill by default", async () => {
    // Given a selected parent and a lone leaf, shown in the field
    const r = await render(<TreeHarness initial={["basketball", "golf"]} />);
    // Then each option the count includes is a pill, parents and children alike
    expect(r.sports_pill_0).toHaveTextContent("Basketball");
    expect(r.sports_pill_1).toHaveTextContent("NBA");
    expect(r.sports_pill_2).toHaveTextContent("WNBA");
    expect(r.sports_pill_3).toHaveTextContent("Golf");
    expect(r.sports_count).toHaveTextContent("4");
  });

  it("shows only a count badge when selectionView is badgeOnly", async () => {
    // Given a selected parent and a lone leaf, shown as badge only
    const r = await render(<TreeHarness initial={["basketball", "golf"]} selectionView="badgeOnly" />);
    // Then only the count badge is shown, and no in-field pills
    expect(r.sports_count).toHaveTextContent("4");
    expect(r.query.sports_pill_0).toBeNull();
  });

  it("shows only the root selections as in-field pills when selectionDisplay is root", async () => {
    // Given a selected parent and a lone leaf, shown in the field by root
    const r = await render(
      <TreeHarness initial={["basketball", "golf"]} selectionView="inField" selectionDisplay="root" />,
    );
    // Then the parent's children are not pills, and the badge counts the two roots
    expect(r.sports_pill_0).toHaveTextContent("Basketball");
    expect(r.sports_pill_1).toHaveTextContent("Golf");
    expect(r.query.sports_pill_2).toBeNull();
    expect(r.sports_count).toHaveTextContent("2");
  });

  it("lists the selectionDisplay bucket below the field when selectionList", async () => {
    // Given a selected parent and a lone leaf, listed below the field by leaf
    const r = await render(
      <TreeHarness initial={["basketball", "golf"]} selectionView="selectionList" selectionDisplay="leaf" />,
    );
    // Then every selected leaf is a pill below the field
    expect(r.selectedOptionPillList_pill_value_0).toHaveTextContent("NBA");
    expect(r.selectedOptionPillList_pill_value_1).toHaveTextContent("WNBA");
    expect(r.selectedOptionPillList_pill_value_2).toHaveTextContent("Golf");
  });

  it("removes a selection from its list pill", async () => {
    // Given Golf listed below the field
    const r = await render(<TreeHarness initial={["golf"]} selectionView="selectionList" />);
    // When removing the Golf pill
    click(r.selectedOptionPillList_pill_remove_0);
    // Then no selection is listed
    expect(r.query.selectedOptionPillList).toBeNull();
  });

  it("scopes a disabled tree option tooltip to the field prefix", async () => {
    // Given a tree select with a disabled leaf and an explicit prefix
    const r = await render(
      <MenuTreeSelectField
        label="Sports"
        options={[{ id: "basketball", name: "Basketball", children: [{ id: "nba", name: "NBA" }] }]}
        values={[]}
        onSelect={() => {}}
        disabledOptions={[{ value: "nba", reason: "No access" }]}
        defaultExpanded
        data-testid="leagues"
      />,
    );
    // When opening the tree
    click(r.leagues);
    // Then the leaf tooltip is directly addressable
    expect(r.leagues_option_tooltip).toHaveAttribute("title", "No access");
  });
});

type Sport = { id: string; name: string };

type TreeHarnessProps = {
  onSelectSpy?: (response: TreeSelectResponse<Sport, string>) => void;
  initial?: string[];
  options?: OptionsOrLoad<NestedOption<Sport>>;
  disabledOptions?: string[];
  selectionDisplay?: TreeSelectionDisplay;
  selectionView?: SelectionView;
  proposedValues?: string[];
  defaultExpanded?: boolean;
  mixedValues?: string[];
};

function TreeHarness(props: TreeHarnessProps) {
  const { onSelectSpy, initial = [], options = sports(), ...others } = props;
  const [values, setValues] = useState<string[]>(initial);
  return (
    <MenuTreeSelectField<Sport, string>
      label="Sports"
      options={options}
      values={values}
      onSelect={(response) => {
        onSelectSpy?.(response);
        setValues(response.all.values);
      }}
      {...others}
    />
  );
}

function activeOption(listbox: HTMLElement): string | null {
  return listbox.getAttribute("aria-activedescendant");
}

function checkboxOf(sports: HTMLElement, label: string): Element | null {
  return getOption(sports, label).querySelector("[data-checked]");
}

const nba: NestedOption<Sport> = { id: "nba", name: "NBA" };

const wnba: NestedOption<Sport> = { id: "wnba", name: "WNBA" };

const basketball: NestedOption<Sport> = { id: "basketball", name: "Basketball", children: [nba, wnba] };

function sports(): NestedOption<Sport>[] {
  return [
    {
      id: "baseball",
      name: "Baseball",
      children: [
        { id: "mlb", name: "MLB" },
        { id: "milb", name: "MiLB" },
      ],
    },
    basketball,
    { id: "golf", name: "Golf" },
  ];
}

function sharedChild(): NestedOption<Sport>[] {
  return [
    { id: "p1", name: "Parent 1", children: [{ id: "c1", name: "Child 1" }] },
    { id: "p2", name: "Parent 2", children: [{ id: "c1", name: "Child 1" }] },
  ];
}

function manySports(): NestedOption<Sport>[] {
  const [baseball, basketballOption, golf] = sports();
  return [
    baseball,
    basketballOption,
    {
      id: "football",
      name: "Football",
      children: [
        { id: "nfl", name: "NFL" },
        { id: "ncaa", name: "NCAA" },
      ],
    },
    golf,
    { id: "hockey", name: "Hockey", children: [{ id: "nhl", name: "NHL" }] },
  ];
}
