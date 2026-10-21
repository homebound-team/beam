import { fireEvent } from "@testing-library/react";
import { useState } from "react";
import { MenuTreeSelectField } from "src/inputs/MenuSelectField/MenuTreeSelectField";
import type { NestedOption, TreeSelectionDisplay, TreeSelectResponse } from "src/inputs/TreeSelectField/utils";
import { click, getOptions, getSelected, render, select, type } from "src/utils/rtl";
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

  it("expands the groups that hold a selection", async () => {
    // Given a nested option selected
    const r = await render(<TreeHarness initial={["nba"]} />);
    // When opening it
    click(r.sports);
    // Then its group is expanded and partially checked, and other groups stay collapsed
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "NBA", "WNBA", "Golf"]);
    expect(getSelected(r.sports)).toBe("NBA");
    expect(checkboxOf(r, "Basketball")).toHaveAttribute("data-checked", "mixed");
  });

  it("selects every child when a parent is selected", async () => {
    // Given a tree with nothing selected
    const onSelect = vi.fn();
    const r = await render(<TreeHarness onSelectSpy={onSelect} />);
    // When selecting a parent
    select(r.sports, "Basketball");
    // Then the response covers the parent and its children
    expect(onSelect).toHaveBeenLastCalledWith({
      all: { values: ["basketball", "nba", "wnba"], options: [basketball(), nba(), wnba()] },
      leaf: { values: ["nba", "wnba"], options: [nba(), wnba()] },
      root: { values: ["basketball"], options: [basketball()] },
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
    expect(onSelect.mock.lastCall?.[0].all.values).toEqual(["basketball", "nba", "wnba"]);
    expect(onSelect.mock.lastCall?.[0].root.values).toEqual(["basketball"]);
  });

  it("deselects the parent when a child is deselected", async () => {
    // Given a selected parent
    const onSelect = vi.fn();
    const r = await render(<TreeHarness initial={["basketball"]} onSelectSpy={onSelect} />);
    // When deselecting one of its children
    select(r.sports, "NBA");
    // Then only the other child remains
    expect(onSelect).toHaveBeenLastCalledWith({
      all: { values: ["wnba"], options: [wnba()] },
      leaf: { values: ["wnba"], options: [wnba()] },
      root: { values: ["wnba"], options: [wnba()] },
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
    expect(activeOption(r.sports_listbox)).toMatch(/-option-1$/);
    // When pressing ArrowRight
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowRight" });
    // Then the group expands and focus stays on it
    expect(getOptions(r.sports)).toEqual(["Baseball", "Basketball", "NBA", "WNBA", "Golf"]);
    expect(activeOption(r.sports_listbox)).toMatch(/-option-1$/);
    // And ArrowRight again steps into the first child, ArrowLeft steps back out
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowRight" });
    expect(activeOption(r.sports_listbox)).toMatch(/-option-2$/);
    fireEvent.keyDown(r.sports_listbox, { key: "ArrowLeft" });
    expect(activeOption(r.sports_listbox)).toMatch(/-option-1$/);
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
    expect(activeOption(r.sports_listbox)).toMatch(/-option-2$/);
    // When collapsing its group from the chevron
    click(r.sports_expand_basketball);
    // Then focus is on the group
    expect(activeOption(r.sports_listbox)).toMatch(/-option-1$/);
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
});

type Sport = { id: string; name: string };

type TreeHarnessProps = {
  onSelectSpy?: (response: TreeSelectResponse<Sport, string>) => void;
  initial?: string[];
  options?: NestedOption<Sport>[];
  disabledOptions?: string[];
  selectionDisplay?: TreeSelectionDisplay;
  proposedValues?: string[];
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

function checkboxOf(r: { getAllByTestId: (id: string) => HTMLElement[] }, label: string): Element | null {
  const option = r.getAllByTestId("sports_option").find((o) => o.dataset.label === label);
  return option?.querySelector("[data-checked]") ?? null;
}

function nba(): NestedOption<Sport> {
  return { id: "nba", name: "NBA" };
}

function wnba(): NestedOption<Sport> {
  return { id: "wnba", name: "WNBA" };
}

function basketball(): NestedOption<Sport> {
  return { id: "basketball", name: "Basketball", children: [nba(), wnba()] };
}

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
    basketball(),
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
