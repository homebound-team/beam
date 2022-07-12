import { ASC, DESC } from "src/components/Table/GridTable";
import { deriveSortState } from "src/components/Table/useSortState";

describe("useSortState", () => {
  it("can derive the next sort state when current state is undefined", () => {
    expect(deriveSortState(undefined, 2, undefined)).toEqual([2, ASC, undefined]);
  });

  it("can derive the next sort state when clicking on a new column", () => {
    expect(deriveSortState([1, ASC, undefined], 2, undefined)).toEqual([2, ASC, undefined]);
  });

  it("can derive the next sort state when clicking on a currently ascending column", () => {
    expect(deriveSortState([1, ASC, undefined], 1, undefined)).toEqual([1, DESC, undefined]);
    // With `initialSortState` the same as the currentSortState Ascending
    expect(deriveSortState([1, ASC, undefined], 1, [1, ASC, undefined])).toEqual([1, DESC, undefined]);
  });

  it("can derive the next sort state when clicking on a currently descending column", () => {
    // With `initialSortState` defined
    expect(deriveSortState([1, DESC, undefined], 1, [2, ASC, undefined])).toEqual([2, ASC, undefined]);
    // Without `initialSortState` defined
    expect(deriveSortState([1, DESC, undefined], 1, undefined)).toEqual(undefined);
    // With `initialSortState` the same as the currentSortState Descending
    expect(deriveSortState([1, DESC, undefined], 1, [1, DESC, undefined])).toEqual([1, ASC, undefined]);
  });
});
