import { multiFilter } from "src/components/Filters/MultiFilter";

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
});
