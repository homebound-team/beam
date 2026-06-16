import {
  resolveOptionSelectedFilterLabel,
  resolveTreeSelectedFilterLabel,
} from "src/components/Filters/selectedFilterLabelUtils";
import { NestedOption } from "src/inputs/TreeSelectField/utils";

describe("resolveOptionSelectedFilterLabel", () => {
  it("returns the option label for a static options list", () => {
    // Given a static options list containing the selected value
    const options = [
      { label: "Jane Smith", value: "u:2" },
      { label: "John Doe", value: "u:1" },
    ];

    // When resolving the label for a known value
    const label = resolveOptionSelectedFilterLabel(
      options,
      (o) => o.value,
      (o) => o.label,
      "u:2",
    );

    // Then the option label is returned
    expect(label).toBe("Jane Smith");
  });

  it("falls back to String(value) when the option is not found", () => {
    // Given a static options list that does not include the value
    const options = [{ label: "Jane Smith", value: "u:2" }];

    // When resolving the label for an unknown value
    const label = resolveOptionSelectedFilterLabel(
      options,
      (o) => o.value,
      (o) => o.label,
      "u:99",
    );

    // Then the raw value is stringified as fallback
    expect(label).toBe("u:99");
  });

  it("resolves labels from current when options are not loaded yet", () => {
    // Given lazy options with only current populated
    const options = {
      current: [{ label: "Jane Smith", value: "u:2" }],
      load: async () => {},
      options: undefined,
    };

    // When resolving the label for a value in current
    const label = resolveOptionSelectedFilterLabel(
      options,
      (o) => o.value,
      (o) => o.label,
      "u:2",
    );

    // Then the label from current is returned
    expect(label).toBe("Jane Smith");
  });
});

describe("resolveTreeSelectedFilterLabel", () => {
  it("returns the option label for a nested option", () => {
    // Given a nested tree options list containing the selected value
    const options: NestedOption<{ name: string; id: string }>[] = [
      {
        id: "parent",
        name: "Parent",
        children: [{ id: "child", name: "Child Region" }],
      },
    ];

    // When resolving the label for a nested value
    const label = resolveTreeSelectedFilterLabel(
      options,
      (o) => o.id,
      (o) => o.name,
      "child",
    );

    // Then the option label is returned
    expect(label).toBe("Child Region");
  });

  it("falls back to String(value) when the tree option is not found", () => {
    // Given a tree options list that does not include the value
    const options: NestedOption<{ name: string; id: string }>[] = [{ id: "parent", name: "Parent" }];

    // When resolving the label for an unknown value
    const label = resolveTreeSelectedFilterLabel(
      options,
      (o) => o.id,
      (o) => o.name,
      "missing",
    );

    // Then the raw value is stringified as fallback
    expect(label).toBe("missing");
  });

  it("resolves labels from current when tree options are not loaded yet", () => {
    // Given lazy tree options with only current populated
    const options = {
      current: [{ id: "child", name: "Child Region" }],
      load: async () => ({ options: [{ id: "child", name: "Child Region" }] }),
    };

    // When resolving the label for a value in current
    const label = resolveTreeSelectedFilterLabel(
      options,
      (o) => o.id,
      (o) => o.name,
      "child",
    );

    // Then the label from current is returned
    expect(label).toBe("Child Region");
  });
});
