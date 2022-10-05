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

  it("should return visible Columns", async () => {
    // Given an useColumns with 2 columns 1 of them canHide=true
    const { result } = renderHook(() => useColumns([nameColumn, valueColumn]));
    // Then visible should be  have 1 element
    expect(result.current[0]).toHaveLength(1);
    expect(result.current[0][0]).toEqual(nameColumn);
  });
});
