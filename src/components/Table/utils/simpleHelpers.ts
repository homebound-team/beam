import { GridDataRow } from "src/components/Table/components/Row";

/**
 * A helper for making `Row` type aliases of simple/flat tables that are just header + data.
 *
 * Unlike `SimpleHeaderAndDataOf`, we keep `T` in a separate `data`, which is useful
 * when rows are mobx proxies and we need proxy accesses to happen within the column
 * rendering.
 */
export type SimpleHeaderAndData<T> =
  | { kind: "header"; id: "header"; data: undefined }
  // We put `id` here so that GridColumn can match against `extends { data, id }`,
  // kinda looks like we should combine Row and GridDataRow, i.e. Rows always have ids,
  // they already have kinds, and need to have ids when passed to rows anyway...
  | { kind: "data"; id: string; data: T };

/** A const for a marker header row. */
export const simpleHeader = { kind: "header" as const, id: "header" as const, data: undefined };
export const simpleExpandableHeader = { kind: "expandableHeader" as const, id: "expandableHeader", data: undefined };

/** Like `simpleRows` but for `SimpleHeaderAndData`. */
export function simpleDataRows<D extends { id: string }>(
  data: Array<D> | undefined = [],
): GridDataRow<SimpleHeaderAndData<D>>[] {
  return [simpleHeader, ...data.map((data) => ({ kind: "data" as const, data, id: data.id }))];
}
