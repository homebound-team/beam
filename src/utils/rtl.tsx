import { newLocation as _newLocation, withRouter as _withRouter } from "@homebound/rtl-react-router-utils";
import {
  allowAndWaitForAsyncBehavior,
  blur as _blur,
  change as _change,
  click as _click,
  focus as _focus,
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
  _blur as blur,
  _change as change,
  _click as click,
  _focus as focus,
  _getOptions as rtlUtilGetOptions,
  _input as input,
  _select as rtlUtilSelect,
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

/** Intended to be used to generate a human-readable text 
 * representation of a GridTable using the markdown table syntax.
 * * Example Use: expect(tableSnapshot(r)).toMatchInlineSnapshot(`
      "
      | Name                     | Value |
      | ------------------------ | ----- |
      | Row 1                    | 200   |
      | Row 2 with a longer name | 300   |
      | Row 3                    | 1000  |
      "
    `);
 * */
export function tableSnapshot(r: RenderResult): string {
  const tableEl = r.getByTestId("gridTable");
  const dataRows = Array.from(tableEl.querySelectorAll("[data-gridrow]"));
  const hasExpandableHeader = !!tableEl.querySelector(`[data-testid="expandableColumn"]`);

  const tableDataAsStrings = dataRows.map((row) => {
    return Array.from(row.childNodes).map(getTextFromTableCellNode);
  });

  return toMarkupTableString({ tableRows: tableDataAsStrings, hasExpandableHeader });
}

function toMarkupTableString({
  tableRows,
  hasExpandableHeader,
}: {
  tableRows: (string | null)[][];
  hasExpandableHeader: boolean;
}) {
  // Find the largest width of each column to set a consistent width for each row
  const columnWidths = tableRows.reduce((acc, row) => {
    row.forEach((cell, columnIndex) => {
      const cellWidth = cell?.length ?? 0;
      const currentMaxWidth = acc.get(columnIndex) ?? 0;
      if (cellWidth > currentMaxWidth || !currentMaxWidth) acc.set(columnIndex, cellWidth);
    });

    return acc;
  }, new Map<number, number>());

  const wrapTableRowEnds = (str: string) => `| ${str} |`;

  const rowsWithPaddingAndDividers = tableRows.map((tableCells) => {
    const formattedRow = tableCells
      .map((cell, columnIndex) => {
        const cellWidth = columnWidths.get(columnIndex) ?? 0;
        return cell?.padEnd(cellWidth, " ") || "";
      })
      .join(" | ");
    return wrapTableRowEnds(formattedRow);
  });

  const headerDivider = Array.from(columnWidths.values())
    .map((width) => "-".repeat(width) ?? "")
    .join(" | ");

  const headerDividerRowNumber = hasExpandableHeader ? 2 : 1;
  rowsWithPaddingAndDividers.splice(headerDividerRowNumber, 0, wrapTableRowEnds(headerDivider));

  // Pad a newline on top and bottom for cleaner diffs
  return `\n${rowsWithPaddingAndDividers.join("\n")}\n`;
}

/** Prefer showing a `value` from a mocked input vs. the combined text content from an inputs markup */
function getTextFromTableCellNode(node: ChildNode) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;

    const maybeInput = element.getElementsByTagName("input")[0];
    if (maybeInput) return maybeInput.value;

    const maybeTextarea = element.getElementsByTagName("textarea")[0];
    if (maybeTextarea) return maybeTextarea.value;

    const maybeSelect = element.getElementsByTagName("select")[0];
    if (maybeSelect) return maybeSelect.value;
  }

  return node.textContent;
}

/** RTL wrapper for Beam's SuperDrawer/Modal context. */
export const withBeamRTL: Wrapper = {
  wrap: (c) => <BeamProvider>{c}</BeamProvider>,
};

/** Selects an option from the Beam SelectField, MultiSelectField, and TreeSelectField components
 * For select fields that support multiple selections, subsequent calls to this function will toggle the selection state of an option.
 * @param value The value or label of the option.
 * */
export function select(element: HTMLElement, value: string | string[]) {
  const select = resolveIfNeeded(element);
  if (isSelectElement(select)) {
    throw new Error("Beam select helper does not support <select> elements.");
  }

  if (!isInputElement(select)) {
    throw new Error(`Expected element to be INPUT, but got ${select.nodeName}. This field may be read-only.`);
  }

  function maybeOpenAndSelect(optionValue: string) {
    const listboxId = select.getAttribute("aria-controls");
    const body = select.closest("body") as HTMLElement;
    const listbox = body.querySelector(`#${listboxId}`) as HTMLElement;
    if (!listbox) {
      _click(select);
    }
    const options: NodeListOf<HTMLElement> = body.querySelectorAll("[role=option]");
    // Allow searching for options by their data-key (value) or textContent (label)
    const optionToSelect = Array.from(options).find(
      (o: HTMLElement) => o.dataset.key === optionValue || o.dataset.label === optionValue,
    );
    if (!optionToSelect) {
      throw new Error(`Could not find option with value or text content of ${optionValue}`);
    }
    _click(optionToSelect);
  }

  const optionValues = Array.isArray(value) ? value : [value];
  optionValues.forEach((optionValue) => {
    maybeOpenAndSelect(optionValue);
  });
}

export function selectAndWait(input: HTMLElement, value: string | string[]): Promise<void> {
  return allowAndWaitForAsyncBehavior(() => select(input, value));
}

export function getSelected(element: HTMLElement): string[] | string | undefined {
  const select = resolveIfNeeded(element);
  if (isSelectElement(select)) {
    throw new Error("Beam getSelected helper does not support <select> elements");
  }

  if (!isInputElement(select) && select.dataset.readonly === "true") {
    // For read-only fields that render as a 'div'
    return select.textContent ?? undefined;
  }

  const listboxId = select.getAttribute("aria-controls");
  const body = select.closest("body") as HTMLElement;
  const listbox = body.querySelector(`#${listboxId}`) as HTMLElement;
  if (!listbox) {
    _click(select);
  }
  const options: NodeListOf<HTMLElement> = body.querySelectorAll("[role=option]");

  const selections: string[] = Array.from(options)
    .filter((o: HTMLElement) => o.getAttribute("aria-selected") === "true")
    .map((o: HTMLElement) => o.dataset.label ?? o.dataset.key ?? "")
    // Filter out empty strings
    .filter((o) => !!o);

  return selections.length > 0 ? (selections.length > 1 ? selections : selections[0]) : undefined;
}

export function getOptions(element: HTMLElement): string[] {
  const select = resolveIfNeeded(element);
  if (isSelectElement(select)) {
    throw new Error("Beam getOptions helper does not support <select> elements");
  }

  if (!isInputElement(select)) {
    throw new Error(
      `Expected element to be INPUT, but got ${select.nodeName}. This field may be read-only. In that case we cannot get the list of options`,
    );
  }

  const listboxId = select.getAttribute("aria-controls");
  const body = select.closest("body") as HTMLElement;
  const listbox = body.querySelector(`#${listboxId}`) as HTMLElement;
  if (!listbox) {
    _click(select);
  }
  const options: NodeListOf<HTMLElement> = body.querySelectorAll("[role=option]");

  return Array.from(options)
    .map((o: HTMLElement) => o.dataset.label ?? o.dataset.key ?? "")
    .filter((o) => !!o);
}

function resolveIfNeeded(element: HTMLElement): HTMLElement {
  const maybeProxy = element as any;
  return maybeProxy instanceof Function ? maybeProxy() : element;
}

function isSelectElement(element: HTMLElement): element is HTMLSelectElement {
  return element.nodeName === "SELECT";
}

function isInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.nodeName === "INPUT";
}
