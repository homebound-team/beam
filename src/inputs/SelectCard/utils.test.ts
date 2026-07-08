import { SelectCardListGroupItemOption } from "src/inputs/SelectCard/types";
import { findToggledSelectCardGroupValue, getNextSelectCardGroupValues } from "src/inputs/SelectCard/utils";

enum TestCategory {
  Math,
  History,
  Na,
}

function createOptions(): SelectCardListGroupItemOption<TestCategory>[] {
  return [
    { label: "Math", value: TestCategory.Math },
    { label: "History", value: TestCategory.History },
    { label: "N/A", value: TestCategory.Na, selectionBehavior: "exclusive" },
  ];
}

describe("getNextSelectCardGroupValues", () => {
  it("adds a value in multi-select mode", () => {
    const options = createOptions();
    // Given Math is selected
    // When selecting History
    const next = getNextSelectCardGroupValues({
      currentValues: [TestCategory.Math],
      clickedValue: TestCategory.History,
      options,
    });
    // Then both are selected
    expect(next).toEqual([TestCategory.Math, TestCategory.History]);
  });

  it("selecting an exclusive option clears other values", () => {
    const options = createOptions();
    // Given Math and History are selected
    const next = getNextSelectCardGroupValues({
      currentValues: [TestCategory.Math, TestCategory.History],
      clickedValue: TestCategory.Na,
      options,
    });
    // Then only N/A remains
    expect(next).toEqual([TestCategory.Na]);
  });

  it("selecting a non-exclusive option clears exclusive values", () => {
    const options = createOptions();
    // Given N/A is selected
    const next = getNextSelectCardGroupValues({
      currentValues: [TestCategory.Na],
      clickedValue: TestCategory.Math,
      options,
    });
    // Then N/A is replaced by Math
    expect(next).toEqual([TestCategory.Math]);
  });

  it("toggles off a selected value in multi-select mode", () => {
    const options = createOptions();
    const next = getNextSelectCardGroupValues({
      currentValues: [TestCategory.Math],
      clickedValue: TestCategory.Math,
      options,
    });
    expect(next).toEqual([]);
  });

  it("returns current values when the clicked value is not in options", () => {
    const options = createOptions();
    const next = getNextSelectCardGroupValues({
      currentValues: [TestCategory.Math],
      clickedValue: 99 as TestCategory,
      options,
    });
    expect(next).toEqual([TestCategory.Math]);
  });
});

describe("findToggledSelectCardGroupValue", () => {
  it("finds an added value", () => {
    expect(findToggledSelectCardGroupValue([1], [1, 2])).toBe(2);
  });

  it("finds a removed value", () => {
    expect(findToggledSelectCardGroupValue([1, 2], [1])).toBe(2);
  });

  it("returns undefined when there is no change", () => {
    expect(findToggledSelectCardGroupValue([1, 2], [1, 2])).toBeUndefined();
  });
});
