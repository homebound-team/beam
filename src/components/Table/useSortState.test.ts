import { ASC, DESC } from "src/components/Table/GridTable";
import { deriveSortState } from "src/components/Table/useSortState";

describe("useSortState", () => {
  it("can derive the next sort state when current state is undefined", () => {
    expect(deriveSortState(undefined, 2, undefined)).toEqual([2, ASC]);
  });
  it("can derive the next sort state when clicking on a new column", () => {
    expect(deriveSortState([1, ASC], 2, undefined)).toEqual([2, ASC]);
  });
  it("can derive the next sort state when clicking on a currently ascending column", () => {
    expect(deriveSortState([1, ASC], 1, undefined)).toEqual([1, DESC]);
  });
  it("can derive the next sort state when clicking on a currently descending column", () => {
    // With `initialSortState` defined
    expect(deriveSortState([1, DESC], 1, [2, ASC])).toEqual([2, ASC]);
    // Without `initialSortState` defined
    expect(deriveSortState([1, DESC], 1, undefined)).toEqual(undefined);
  });
});
