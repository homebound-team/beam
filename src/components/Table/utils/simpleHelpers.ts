import { GridDataRow } from "src/components/Table/types";

/**
 * A helper for making `Row` type aliases of simple/flat tables that are just header + data.
 *
 * Unlike `SimpleHeaderAndDataOf`, we keep `T` in a separate `data`, which is useful
 * when rows are mobx proxies and we need proxy accesses to happen within the column
 * rendering.
 */
export type SimpleHeaderAndData<T> =
  | { kind: "header" }
  // We put `id` here so that GridColumn can match against `extends { data, id }`,
  // kinda looks like we should combine Row and GridDataRow, i.e. Rows always have ids,
  // they already have kinds, and need to have ids when passed to rows anyway...
  | { kind: "data"; data: T; id: string };

/** A const for a marker header row. */
export const simpleHeader = { kind: "header" as const, id: "header", data: {} };

/** Like `simpleRows` but for `SimpleHeaderAndData`. */
export function simpleDataRows<R extends SimpleHeaderAndData<D>, D>(
  data: Array<D & { id: string }> | undefined = [],
): GridDataRow<R>[] {
  // @ts-ignore Not sure why this doesn't type-check, something esoteric with the DiscriminateUnion type
  return [simpleHeader, ...data.map((data) => ({ kind: "data" as const, data, id: data.id }))];
}
