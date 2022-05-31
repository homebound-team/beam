import { collapseColumn, selectColumn } from "src/components/Table/columns";
import { getKinds } from "src/components/Table/GridRowLookup";
import { GridColumn } from "src/components/Table/GridTable";

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

    expect(getKinds(columns)).toEqual(["header", "group", "data"]);
  });
});
