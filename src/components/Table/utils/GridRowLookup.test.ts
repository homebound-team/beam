import { GridColumn } from "src/components/Table/types";
import { assignDefaultColumnIds, collapseColumn, selectColumn } from "src/components/Table/utils/columns";
import { getKinds } from "src/components/Table/utils/GridRowLookup";

describe("GridRowLookup", () => {
  it("ignores action columns when calling 'getKinds'", () => {
    type Row =
      | { kind: "header"; id: "header"; data: {} }
      | { kind: "group"; id: "group"; data: {} }
      | { kind: "data"; id: string; data: {} };

    const columns: GridColumn<Row>[] = [
      collapseColumn(),
      selectColumn(),
      { header: () => "Header", group: () => "Group", data: () => "Data" },
    ];

    expect(getKinds(assignDefaultColumnIds(columns))).toEqual(["header", "group", "data"]);
  });
});
