import { booleanFilter } from "src/components/Filters/BooleanFilter";

describe("BooleanFilter", () => {
  it("returns the option label for true and false", () => {
    // Given a booleanFilter with default options
    const filter = booleanFilter({ label: "Archived" })("archived");

    // When formatting labels for true and false
    const yesLabel = filter.formatSelectedFilterLabel(true);
    const noLabel = filter.formatSelectedFilterLabel(false);

    // Then the configured option labels are returned
    expect(yesLabel).toBe("Yes");
    expect(noLabel).toBe("No");
  });

  it("uses custom option labels when provided", () => {
    // Given a booleanFilter with custom options
    const filter = booleanFilter({
      label: "Archived",
      options: [
        [true, "Archived only"],
        [false, "Not archived"],
      ],
    })("archived");

    // When formatting labels for true and false
    const yesLabel = filter.formatSelectedFilterLabel(true);
    const noLabel = filter.formatSelectedFilterLabel(false);

    // Then the custom option labels are returned
    expect(yesLabel).toBe("Archived only");
    expect(noLabel).toBe("Not archived");
  });
});
