import { RenderResult, Wrapper } from "@homebound/rtl-utils";
import { prettyDOM } from "@testing-library/react";
import { SuperDrawerProvider } from "src";
export * from "@homebound/rtl-react-router-utils";
export * from "@homebound/rtl-utils";

export function cell(r: RenderResult, row: number, column: number): HTMLElement {
  return r.getByTestId("grid-table").childNodes[row].childNodes[column] as HTMLElement;
}

export function cellOf(r: RenderResult, testId: string, row: number, column: number): HTMLElement {
  return r.getByTestId(testId).childNodes[row].childNodes[column] as HTMLElement;
}

export function cellAnd(r: RenderResult, row: number, column: number, testId: string): HTMLElement {
  return (
    cell(r, row, column).querySelector(`[data-testid="${testId}"]`) ||
    fail(`Element not found ${prettyDOM(cell(r, row, column))}`)
  );
}

export function row(r: RenderResult, row: number): HTMLElement {
  return r.getByTestId("grid-table").childNodes[row] as HTMLElement;
}

export function rowAnd(r: RenderResult, row: number, testId: string): HTMLElement {
  const e = r.getByTestId("grid-table").childNodes[row] as HTMLElement;
  return e.querySelector(`[data-testid="${testId}"]`) || fail(`Element not found ${prettyDOM(e)}`);
}

/** RTL wrapper for SuperDrawer context */
export const withSuperDrawerRTL: Wrapper = {
  wrap: (c) => <SuperDrawerProvider>{c}</SuperDrawerProvider>,
};
