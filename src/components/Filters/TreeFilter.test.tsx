import { useState } from "react";
import { Filters } from "src/components/Filters/Filters";
import { treeFilter, TreeFilterProps } from "src/components/Filters/TreeFilter";
import { FilterDefs } from "src/components/Filters/types";
import { NestedOption } from "src/inputs";
import { HasIdAndName } from "src/types";
import { click, render } from "src/utils/rtl";
import { zeroTo } from "src/utils/sb";

describe("TreeFilter", () => {
  it("can select root values (default)", async () => {
    // Given the tree filter filtering by root option values (default)
    const r = await render(<TestFilter />);
    // It's initially empty
    expect(r.filter_tree).toHaveValue("All");
    expect(r.value).toHaveTextContent("{}");
    // When selecting some options
    click(r.filter_tree);
    click(r.getByRole("option", { name: "Grandparent 0" }));
    click(r.getByRole("option", { name: "Child 1-0-0" }));
    click(r.getByRole("option", { name: "Parent 1-1" }));
    // Then the filter's value is empty now that we're making selections
    expect(r.filter_tree).toHaveValue("");
    // Then the filter is set to only return the "root" values that are selected.
    expect(r.value).toHaveTextContent('{"tree":["gp:0","child:1-0-0","parent:1-1"]}');
  });

  it("can select leaf values", async () => {
    // Given the tree filter filtering by leaf option values
    const r = await render(<TestFilter filterBy="leaf" />);
    // When selecting some options
    click(r.filter_tree);
    click(r.getByRole("option", { name: "Grandparent 0" }));
    click(r.getByRole("option", { name: "Child 1-0-0" }));
    click(r.getByRole("option", { name: "Parent 1-1" }));
    // Then the filter is set to only return the "root" values that are selected.
    expect(r.value).toHaveTextContent(
      '{"tree":["child:0-0-0","child:0-0-1","child:0-1-0","child:0-1-1","child:1-0-0","child:1-1-0","child:1-1-1"]}',
    );
  });

  it("can select all values", async () => {
    // Given the tree filter filtering by all option values
    const r = await render(<TestFilter filterBy="all" />);
    // When selecting some options
    click(r.filter_tree);
    click(r.getByRole("option", { name: "Grandparent 0" }));
    click(r.getByRole("option", { name: "Child 1-0-0" }));
    click(r.getByRole("option", { name: "Parent 1-1" }));
    // Then the filter is set to only return the "root" values that are selected.
    expect(r.value).toHaveTextContent(
      '{"tree":["gp:0","parent:0-0","child:0-0-0","child:0-0-1","parent:0-1","child:0-1-0","child:0-1-1","child:1-0-0","parent:1-1","child:1-1-0","child:1-1-1"]}',
    );
  });

  it("can set a default value", async () => {
    // Given the tree filter with a default value set
    const r = await render(<TestFilter filterBy="all" defaultValue={["gp:0"]} />);
    // Then the filter is correctly initialized
    expect(r.filter_tree).toHaveValue("");
    expect(r.query.selectedOptionsCount).not.toBeInTheDocument();
    expect(r.filter_tree_unfocusedPlaceholderContainer).toHaveTextContent("Grandparent 0");
    expect(r.value).toHaveTextContent('{"tree":["gp:0"]}');
  });

  it("can customize nothingSelectedText", async () => {
    // Given the tree filter with nothingSelectedText set
    const r = await render(<TestFilter nothingSelectedText="All Projects" />);
    expect(r.filter_tree).toHaveValue("All Projects");
  });

  it("sets value to undefined if no options are selected.", async () => {
    // Given the tree filter a single option selected
    const r = await render(<TestFilter defaultValue={["child:0-0-1"]} />);
    expect(r.value).toHaveTextContent('{"tree":["child:0-0-1"]}');
    // When clearing the selection
    click(r.filter_tree);
    click(r.getByRole("option", { name: "Child 0-0-1" }));
    // Then the value is undefined
    expect(r.value).toHaveTextContent("{}");
  });

  it("returns the option label for a nested value", () => {
    // Given a treeFilter with nested options
    const options: NestedOption<{ id: string; name: string }>[] = [
      {
        id: "parent",
        name: "Parent",
        children: [{ id: "child", name: "Child Region" }],
      },
    ];
    const filter = treeFilter({
      options,
      getOptionValue: (o) => o.id,
      getOptionLabel: (o) => o.name,
      label: "Region",
    })("region");

    // When formatting the label for a nested value
    const label = filter.formatSelectedFilterLabel("child");

    // Then the option label is returned
    expect(label).toBe("Child Region");
  });

  it("resolves labels from current when tree options are not loaded yet", () => {
    // Given a treeFilter with lazy options and current set to the selection
    const filter = treeFilter({
      options: {
        current: [{ id: "child", name: "Child Region" }],
        load: async () => ({ options: [{ id: "child", name: "Child Region" }] }),
      },
      getOptionValue: (o) => o.id,
      getOptionLabel: (o) => o.name,
      label: "Region",
    })("region");

    // When formatting the label for the selected value
    const label = filter.formatSelectedFilterLabel("child");

    // Then the label from current is returned
    expect(label).toBe("Child Region");
  });
});

function TestFilter(props: Partial<TreeFilterProps<HasIdAndName, string>>) {
  const nestedOptions: NestedOption<HasIdAndName>[] = zeroTo(2).map((i) => ({
    id: `gp:${i}`,
    name: `Grandparent ${i}`,
    children: zeroTo(2).map((j) => ({
      id: `parent:${i}-${j}`,
      name: `Parent ${i}-${j}`,
      children: zeroTo(2).map((k) => ({ id: `child:${i}-${j}-${k}`, name: `Child ${i}-${j}-${k}` })),
    })),
  }));

  type FilterWithTree = { tree?: string[] };

  const defs: FilterDefs<FilterWithTree> = {
    tree: treeFilter({
      options: nestedOptions,
      label: "Tree",
      getOptionValue: (o) => o.id,
      getOptionLabel: (o) => o.name,
      ...props,
    }),
  };

  const [filter, setFilter] = useState<FilterWithTree>({ tree: props.defaultValue });
  return (
    <div>
      <Filters filterDefs={defs} filter={filter} onChange={setFilter} />
      <div data-testid="value">{JSON.stringify(filter)}</div>
    </div>
  );
}
