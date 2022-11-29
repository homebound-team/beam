import { deriveSortState, TableState } from "src/components/Table/utils/TableState";
import { ASC, DESC } from "src/components/Table/utils/utils";

describe(TableState, () => {
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
