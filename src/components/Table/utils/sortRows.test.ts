import { GridDataRow } from "src/components/Table/components/Row";
import { GridColumnWithId } from "src/components/Table/types";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { ensureClientSideSortValueIsSortable, sortRows } from "src/components/Table/utils/sortRows";
import { Temporal } from "temporal-polyfill";

describe("sortRows", () => {
  it("can return a sorted copy of nested rows in ascending order", () => {
    // Given a set of unsorted nested rows
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      // And the data is initially unsorted
      {
        kind: "parent",
        id: "2",
        data: { name: "b" },
        children: [
          { kind: "child", id: "2.1", data: { name: "b1" } },
          { kind: "child", id: "2.3", data: { name: "B3" } },
          { kind: "child", id: "2.2", data: { name: "b2" } },
        ],
      },
      { kind: "parent", id: "1", data: { name: "a" } },
      { kind: "parent", id: "3", data: { name: "c" } },
    ];
    // When sorting them in ascending order based on the name property
    const sorted = sortRows([nameColumn], rows, { current: { columnId: nameColumn.id, direction: "ASC" } }, false);
    // Then expected sorted to be in ascending correct order
    expect(rowsToIdArray(sorted)).toEqual(["1", "2", "2.1", "2.2", "2.3", "3", "header"]);
    // TODO Put this back when we have tuple-based sorting
    // And `rows` to maintain original order
    // expect(rowsToIdArray(rows)).toEqual(["header", "2", "2.1", "2.3", "2.2", "1", "3"]);
  });

  it("can return a sorted copy of nested rows in descending order", () => {
    // Given a set of unsorted nested rows
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      // And the data is initially unsorted
      {
        kind: "parent",
        id: "2",
        data: { name: "b" },
        children: [
          { kind: "child", id: "2.1", data: { name: "b1" } },
          { kind: "child", id: "2.3", data: { name: "B3" } },
          { kind: "child", id: "2.2", data: { name: "b2" } },
        ],
      },
      { kind: "parent", id: "1", data: { name: "a" } },
      { kind: "parent", id: "3", data: { name: "c" } },
    ];
    // When sorting them in descending order based on the name property
    const sorted = sortRows([nameColumn], rows, { current: { columnId: nameColumn.id, direction: "DESC" } }, false);
    // Then expected sorted to be in descending correct order
    expect(rowsToIdArray(sorted)).toEqual(["header", "3", "2", "2.3", "2.2", "2.1", "1"]);
    // TODO Put this back when we have tuple-based sorting
    // And `rows` to maintain original order
    // expect(rowsToIdArray(rows)).toEqual(["header", "2", "2.1", "2.3", "2.2", "1", "3"]);
  });

  it("can return a sorted copy of nested rows with case sensitive sort", () => {
    // Given a set of unsorted nested rows
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      // And the data is initially unsorted
      {
        kind: "parent",
        id: "2",
        data: { name: "b" },
        children: [
          { kind: "child", id: "2.1", data: { name: "b1" } },
          { kind: "child", id: "2.3", data: { name: "B3" } },
          { kind: "child", id: "2.2", data: { name: "b2" } },
        ],
      },
      { kind: "parent", id: "1", data: { name: "a" } },
      { kind: "parent", id: "3", data: { name: "C" } },
    ];
    // When sorting them in descending order based on the name property
    const sorted = sortRows([nameColumn], rows, { current: { columnId: nameColumn.id, direction: "DESC" } }, true);
    // Then expected case sensitive sort in descending correct order
    expect(rowsToIdArray(sorted)).toEqual(["2", "2.2", "2.1", "2.3", "1", "header", "3"]);
  });

  it("does not sort within pinned rows", () => {
    // Given a set of unsorted rows
    const rows: GridDataRow<Row>[] = [
      // And this row is not pinned, so should come last
      { kind: "parent", id: "3", data: { name: "a" } },
      // And this row is pinned, so should come first
      { kind: "parent", id: "2", data: { name: "c" }, pin: "first" },
      // And this row is pinned and also before the other pin
      { kind: "parent", id: "1", data: { name: "b" }, pin: "first" },
    ];
    // When sorting them in descending order based on the name property
    const sorted = sortRows([nameColumn], rows, { current: { columnId: nameColumn.id, direction: "ASC" } }, true);
    // Then we kept the 2nd pinned row where it was
    expect(rowsToIdArray(sorted)).toEqual(["2", "1", "3"]);
  });

  it("can sort within primary rows", () => {
    // Given a set of unsorted rows
    const rows: GridDataRow<Row>[] = [
      // And this row is primary and should come first due to name
      { kind: "parent", id: "3", data: { name: "a", favorite: true } },
      // And this row is not primary, so should come last
      { kind: "parent", id: "2", data: { name: "c", favorite: false } },
      // And this row is primary and should come second due to name
      { kind: "parent", id: "1", data: { name: "b", favorite: true } },
    ];
    // When sorting them in descending order based on the name property
    const sorted = sortRows(
      [nameColumn, favoriteColumn],
      rows,
      {
        current: { columnId: nameColumn.id, direction: "ASC" },
        persistent: { columnId: favoriteColumn.id, direction: "DESC" },
      },
      true,
    );
    // Then expected sort in ascending order with primary column sorting on top
    expect(rowsToIdArray(sorted)).toEqual(["3", "1", "2"]);
  });

  it("sorts ZonedDateTime values by instant across time zones", () => {
    // These are intentionally clustered around the same calendar boundary but with very different offsets.
    // Kiritimati (+14) is the earliest instant, UTC is in the middle, and Honolulu (-10) is latest.
    // That makes the test fail if we ever sort by the wall-clock date/time text instead of the actual instant.
    const zdt1 = Temporal.ZonedDateTime.from("2019-12-31T23:00:00-10:00[Pacific/Honolulu]");
    const zdt2 = Temporal.ZonedDateTime.from("2020-01-01T00:00:00+14:00[Pacific/Kiritimati]");
    const zdt3 = Temporal.ZonedDateTime.from("2020-01-01T00:00:00+00:00[UTC]");
    const zonedDateTimeColumn: GridColumnWithId<Row> = {
      id: "dateTime",
      header: "DateTime",
      parent: (data) => ({ content: data.name, value: data.name, sortValue: data.dateTime }),
      child: (data) => ({ content: data.name, value: data.name, sortValue: data.dateTime }),
    };
    const rows: GridDataRow<Row>[] = [
      { kind: "parent", id: "1", data: { name: "honolulu", dateTime: zdt1 } },
      { kind: "parent", id: "2", data: { name: "kiritimati", dateTime: zdt2 } },
      { kind: "parent", id: "3", data: { name: "utc", dateTime: zdt3 } },
    ];
    const sorted = sortRows(
      [zonedDateTimeColumn],
      rows,
      { current: { columnId: zonedDateTimeColumn.id, direction: "ASC" } },
      false,
    );
    expect(rowsToIdArray(sorted)).toEqual(["2", "3", "1"]);
  });

  it("accepts ZonedDateTime sort values for client-side sorting", () => {
    const zonedDateTimeColumn: GridColumnWithId<any> = {
      id: "dateTime",
      header: "DateTime",
      parent: "DateTime",
      child: "DateTime",
    };

    expect(() =>
      ensureClientSideSortValueIsSortable("client", false, zonedDateTimeColumn, 0, {
        content: "utc",
        // The specific instant is not important here; this just needs to be a real ZonedDateTime
        // with an explicit zone annotation so the validation path sees the Temporal object shape.
        sortValue: Temporal.ZonedDateTime.from("2020-01-01T00:00:00+00:00[UTC]"),
      }),
    ).not.toThrow();
  });
});

type HeaderRow = { kind: "header" };
type ParentRow = {
  kind: "parent";
  id: string;
  data: { name: string | undefined; favorite?: boolean | undefined; dateTime?: Temporal.ZonedDateTime | undefined };
};
type ChildRow = {
  kind: "child";
  id: string;
  data: { name: string | undefined; favorite?: boolean | undefined; dateTime?: Temporal.ZonedDateTime | undefined };
};
type Row = HeaderRow | ParentRow | ChildRow;
const nameColumn: GridColumnWithId<Row> = {
  id: "name",
  header: "Name",
  parent: ({ name }) => name,
  child: ({ name }) => name,
};
const favoriteColumn: GridColumnWithId<Row> = {
  id: "favorite",
  header: "favorite",
  parent: ({ favorite }) => favorite,
  child: ({ favorite }) => favorite,
};

function rowsToIdArray(rows: GridDataRow<Row>[]): string[] {
  return rows.flatMap((r) => (r.children ? [r.id, ...r.children.map((c) => c.id)] : r.id));
}
