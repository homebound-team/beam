import { renderHook } from "@testing-library/react-hooks";
import { GridColumn } from "./GridTable";
import { SimpleHeaderAndData } from "./simpleHelpers";
import { useColumns } from "./useColumns";

describe("useColumns", () => {
  type Data = { name: string | undefined; value: number | undefined };
  type Row = SimpleHeaderAndData<Data>;
  const nameColumn: GridColumn<Row> = { name: "name", header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = {
    name: "value",
    header: "Value",
    canHide: true,
    visible: false,
    data: ({ value }) => value,
  };

  it("Should return all Columns", async () => {
    // Given an useColumns with 2 columns 1 of them canHide=true
    const { result } = renderHook(() => useColumns([nameColumn, valueColumn]));
    // Expect all columns to have 2 elements
    expect(result.current[0].allColumns).toHaveLength(2);
    expect(result.current[0].allColumns[0]).toEqual(nameColumn);
    expect(result.current[0].allColumns[1]).toEqual(valueColumn);
  });

  it("Should return visible Columns", async () => {
    // Given an useColumns with 2 columns 1 of them canHide=true
    const { result } = renderHook(() => useColumns([nameColumn, valueColumn]));
    // Expect visible columns to have 1 element
    expect(result.current[0].visibleColumns).toHaveLength(1);
    expect(result.current[0].visibleColumns[0]).toEqual(nameColumn);
  });
});
