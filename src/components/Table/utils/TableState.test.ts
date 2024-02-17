import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import { deriveSortState, TableState } from "src/components/Table/utils/TableState";
import { ASC, DESC } from "src/components/Table/utils/utils";

describe(TableState, () => {
  it("preserves expanded state", () => {
    // Given some column definitions and initial state
    const state = new GridTableApiImpl().tableState;
    const columns = [{ id: "one" }, { id: "two" }];
    state.setColumns(columns, undefined);

    // When we toggle a column
    state.toggleExpandedColumn("one");
    expect(state.expandedColumnIds).toEqual(["one"]);
    // And setColumns gets called again (perhaps as the result of an updated createColumns() result)
    state.setColumns([...columns], undefined);

    // Then expect our expanded column to still be expanded
    expect(state.expandedColumnIds).toEqual(["one"]);
  });

  describe(deriveSortState, () => {
    it("can derive the next sort state when current state is undefined", () => {
      expect(deriveSortState({}, "2", undefined)).toEqual({ current: { columnId: "2", direction: ASC } });
    });

    it("can derive the next sort state when clicking on a new column", () => {
      expect(deriveSortState({ current: { columnId: "1", direction: ASC } }, "2", undefined)).toEqual({
        current: { columnId: "2", direction: ASC },
      });
    });

    it("can derive the next sort state when clicking on a currently ascending column", () => {
      expect(deriveSortState({ current: { columnId: "1", direction: ASC } }, "1", undefined)).toEqual({
        current: { columnId: "1", direction: DESC },
      });
      // With `initialSortState` the same as the currentSortState Ascending
      expect(
        deriveSortState({ current: { columnId: "1", direction: ASC } }, "1", {
          current: { columnId: "1", direction: ASC },
        }),
      ).toEqual({ current: { columnId: "1", direction: DESC } });
    });

    it("can derive the next sort state when clicking on a currently descending column", () => {
      // With `initialSortState` defined
      expect(
        deriveSortState({ current: { columnId: "1", direction: DESC } }, "1", {
          current: { columnId: "2", direction: ASC },
        }),
      ).toEqual({ current: { columnId: "2", direction: ASC } });
      // Without `initialSortState` defined
      expect(deriveSortState({ current: { columnId: "1", direction: DESC } }, "1", undefined)).toEqual(undefined);
      // With `initialSortState` the same as the currentSortState Descending
      expect(
        deriveSortState({ current: { columnId: "1", direction: DESC } }, "1", {
          current: { columnId: "1", direction: DESC },
        }),
      ).toEqual({ current: { columnId: "1", direction: ASC } });
    });
  });
});
