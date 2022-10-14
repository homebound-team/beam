import { renderHook } from "@testing-library/react-hooks";
import { useColumns } from "src/components/Table/hooks/useColumns";
import { GridColumn } from "src/components/Table/types";
import { SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";

describe("useColumns", () => {
  type Data = { name: string | undefined; value: number | undefined };
  type Row = SimpleHeaderAndData<Data>;
  const nameColumn: GridColumn<Row> = { id: "name", header: "Name", data: ({ name }) => name };
  const valueColumn: GridColumn<Row> = {
    id: "value",
    header: "Value",
    canHide: true,
    initVisible: false,
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
