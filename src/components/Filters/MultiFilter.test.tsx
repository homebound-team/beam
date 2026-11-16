import { multiFilter } from "src/components/Filters/MultiFilter";
import { click, render } from "src/utils/rtl";
import { useTestIds } from "src/utils/useTestIds";

describe("MultiFilter", () => {
  it("returns the option label for a matching value", () => {
    // Given a multiFilter with static options
    const filter = multiFilter({
      options: [
        { label: "John Doe", value: "u:1" },
        { label: "Jane Smith", value: "u:2" },
      ],
      getOptionLabel: (o) => o.label,
      getOptionValue: (o) => o.value,
      label: "Assignee",
    })("assignee");

    // When formatting the label for one selected value
    const label = filter.formatSelectedFilterLabel("u:2");

    // Then the option label is returned
    expect(label).toBe("Jane Smith");
  });

  it("resolves labels from current when the full list is not loaded yet", () => {
    // Given a multiFilter with lazy options and current set to the selection
    const filter = multiFilter({
      options: {
        current: [{ label: "Jane Smith", value: "u:2" }],
        load: async () => {},
        options: undefined,
      },
      getOptionLabel: (o) => o.label,
      getOptionValue: (o) => o.value,
      label: "Assignee",
    })("assignee");

    // When formatting the label for the selected value
    const label = filter.formatSelectedFilterLabel("u:2");

    // Then the label from current is returned
    expect(label).toBe("Jane Smith");
  });

  it("keeps the menu for a short list in a modal when onSearch is set", async () => {
    // Given a short project list that queries as the user types
    const r = await render(<ModalSearchFilter />);
    // When the menu opens
    click(r.filter_project);
    // Then it stays a searchable menu instead of switching to chips
    expect(r.filter_project.tagName).toBe("BUTTON");
    expect(r.filter_project_search).toBeInTheDocument();
  });

  it("renders with badgeOnly by default", async () => {
    // Given a multiFilter with selected values
    const filter = multiFilter({
      options: [
        { id: "p1", name: "One" },
        { id: "p2", name: "Two" },
      ],
      label: "Project",
    })("project");
    const tid = useTestIds({}, "filter");
    const r = await render(<>{filter.render(["p1", "p2"], () => {}, tid, false, false)}</>);
    // Then the filter shows the count badge and no in-field pills
    expect(r.filter_project_count).toHaveTextContent("2");
    expect(r.query.filter_project_pill_0).toBeNull();
  });
});

function ModalSearchFilter() {
  const filter = multiFilter({
    label: "Project",
    options: [
      { id: "p1", name: "One" },
      { id: "p2", name: "Two" },
      { id: "p3", name: "Three" },
    ],
    onSearch: () => {},
  })("project");
  const tid = useTestIds({}, "filter");
  return <>{filter.render(undefined, () => {}, tid, true, false)}</>;
}
