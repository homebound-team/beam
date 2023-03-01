import { newLocation as _newLocation, withRouter as _withRouter } from "@homebound/rtl-react-router-utils";
import {
  change as _change,
  click as _click,
  getOptions as _getOptions,
  input as _input,
  render as rtlRender,
  RenderResult,
  select as _select,
  type as _type,
  typeAndWait as _typeAndWait,
  wait as _wait,
  Wrapper,
} from "@homebound/rtl-utils";
import { prettyDOM } from "@testing-library/react";
import { ReactElement } from "react";
import { BeamProvider } from "src/components";
export {
  _change as change,
  _click as click,
  _getOptions as getOptions,
  _input as input,
  _select as select,
  _type as type,
  _typeAndWait as typeAndWait,
  _wait as wait,
};
export { _newLocation as newLocation, _withRouter as withRouter };

interface RenderOpts {
  at?: { url: string; route?: string };
  omitBeamContext?: boolean;
}

export function render(
  component: ReactElement,
  withoutBeamProvider: RenderOpts,
  ...otherWrappers: Wrapper[]
): Promise<RenderResult & Record<string, HTMLElement & Function>>;
export function render(
  component: ReactElement,
  ...otherWrappers: Wrapper[]
): Promise<RenderResult & Record<string, HTMLElement & Function>>;
export function render(
  component: ReactElement,
  wrapperOrOpts: RenderOpts | Wrapper | undefined,
  ...otherWrappers: Wrapper[]
): Promise<RenderResult & Record<string, HTMLElement & Function>> {
  let wrappers: Wrapper[];
  if (wrapperOrOpts && "wrap" in wrapperOrOpts) {
    // They passed at least single wrapper + maybe more.
    // We put `withBeamRTL` first so that any `withApollo`s wrap outside of beam, so in-drawer/in-modal content has apollo
    wrappers = [withBeamRTL, wrapperOrOpts as Wrapper, ...otherWrappers];
  } else if (wrapperOrOpts) {
    const { omitBeamContext, at } = wrapperOrOpts;
    wrappers = [
      ...otherWrappers,
      ...(!omitBeamContext ? [withBeamRTL] : []),
      ...(at ? [_withRouter(at.url, at.route)] : [_withRouter()]),
    ];
  } else {
    wrappers = [withBeamRTL];
  }
  return rtlRender(component, { wrappers, wait: true });
}

export function cell(r: RenderResult, row: number, column: number): HTMLElement {
  return cellOf(r, "gridTable", row, column);
}

export function cellOf(r: RenderResult, tableTestId: string, rowNum: number, column: number): HTMLElement {
  return row(r, rowNum, tableTestId).childNodes[column] as HTMLElement;
}

export function cellAnd(r: RenderResult, row: number, column: number, testId: string): HTMLElement {
  return (
    cell(r, row, column).querySelector(`[data-testid="${testId}"]`) ||
    fail(`Element not found ${prettyDOM(cell(r, row, column))}`)
  );
}

export function row(r: RenderResult, row: number, tableTestId: string = "gridTable"): HTMLElement {
  const dataRows = Array.from(r.getByTestId(tableTestId).querySelectorAll("[data-gridrow]"));
  return dataRows[row] as HTMLElement;
}

export function rowAnd(r: RenderResult, rowNum: number, testId: string): HTMLElement {
  const e = row(r, rowNum);
  return e.querySelector(`[data-testid="${testId}"]`) || fail(`Element not found ${prettyDOM(e)}`);
}

/** Intended to be used to generate a human-readable text representation of a GridTable
 * * Example Use: `expect(tableSnapshot(r)).toMatchInlineSnapshot(`
      "Name | Value
      Row 1 | 200
      Row 2 | 300
      Row 3 | 1000"
    `)`
 * */
export function tableSnapshot(r: RenderResult): string {
  const tableEl = r.getByTestId("gridTable");
  const dataRows = Array.from(tableEl.querySelectorAll("[data-gridrow]"));

  return dataRows
    .map((row) => {
      const cellTextContent = Array.from(row.childNodes).map((cell) => cell.textContent);
      return cellTextContent.join(" | ");
    })
    .join("\n");
}

/** RTL wrapper for Beam's SuperDrawer/Modal context. */
export const withBeamRTL: Wrapper = {
  wrap: (c) => <BeamProvider>{c}</BeamProvider>,
};
