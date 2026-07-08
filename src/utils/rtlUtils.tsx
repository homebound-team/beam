import {
  blur as _blur,
  change as _change,
  click as _click,
  clickAndWait as _clickAndWait,
  focus as _focus,
  input as _input,
  type as _type,
  typeAndWait as _typeAndWait,
  wait as _wait,
  allowAndWaitForAsyncBehavior,
  RenderResult,
} from "@homebound/rtl-utils";
import { act, fireEvent, prettyDOM } from "@testing-library/react";
import { fail } from "src/utils/index";

export {
  _blur as blur,
  _change as change,
  _click as click,
  _clickAndWait as clickAndWait,
  _focus as focus,
  _input as input,
  _type as type,
  _typeAndWait as typeAndWait,
  _wait as wait,
};

// This file is a collection of helpers for interacting with Beam components in tests.
// We keep it separate from the `src/tests/rtl.tsx` file, which is the Beam tests
// themselves use, which technically does re-export these `rtlUtils.tsx` helpers, but
// also includes other helpers that are specific to Beam's test suite.
//
// (In particular, we cannot include/export any Beam components, i.e. BeamProvider, from
// this file, because it ends up as a separate bundle in the `package.json` file, which
// will be treated as separate components/providers than the primary bundle.)

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
export function tableSnapshot(r: RenderResult, columnNames: string[] = [], tableTestId: string = "gridTable"): string {
  const tableEl = r.getByTestId(tableTestId);
  const dataRows = Array.from(tableEl.querySelectorAll("[data-gridrow]"));
  const hasExpandableHeader = !!tableEl.querySelector(`[data-testid="expandableColumn"]`);

  let tableDataAsStrings = dataRows.map((row) => {
    return Array.from(row.childNodes).map(getTextFromTableCellNode);
  });

  // If the user wants a subset of columns, look for column names
  if (columnNames.length > 0) {
    const headerCells = tableDataAsStrings[0];
    if (headerCells) {
      const columnIndices = columnNames.map((name) => {
        const i = headerCells.indexOf(name);
        if (i === -1) throw new Error(`Could not find header '${name}' in ${headerCells.join(", ")}`);
        return i;
      });
      tableDataAsStrings = tableDataAsStrings.map((row) => columnIndices.map((index) => row[index]));
    }
  }

  return toMarkupTableString(tableDataAsStrings, hasExpandableHeader);
}

function toMarkupTableString(tableRows: (string | null)[][], hasExpandableHeader: boolean): string {
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

export type ScrollWindowOpts = {
  clientHeight?: number;
  scrollHeight?: number;
};

export type ScrollWindowWithAnchorOpts = ScrollWindowOpts & {
  /** getBoundingClientRect().top when scrollY is 0. Default 0. */
  anchorTop?: number;
  /** Used to derive default scrollHeight and atBottom checks. Default 1_000_000. */
  maxScroll?: number;
  /** Height of the mocked anchor element (rect height/bottom). Default 50. */
  elementHeight?: number;
};

function setWindowScrollMetrics(y: number, opts?: ScrollWindowOpts): void {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  if (opts?.clientHeight != null) {
    Object.defineProperty(document.documentElement, "clientHeight", { value: opts.clientHeight, configurable: true });
  }
  if (opts?.scrollHeight != null) {
    Object.defineProperty(document.documentElement, "scrollHeight", { value: opts.scrollHeight, configurable: true });
  }
}

/** Sets window.scrollY, optionally document scroll metrics, and dispatches a scroll event. */
export function scrollWindow(y: number, opts?: ScrollWindowOpts): void {
  setWindowScrollMetrics(y, opts);
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

/** scrollWindow plus a fake getBoundingClientRect on an anchor/spacer element. */
export function scrollWindowWithAnchor(anchor: HTMLElement, y: number, opts: ScrollWindowWithAnchorOpts = {}): void {
  const clientHeight = opts.clientHeight ?? 800;
  const maxScroll = opts.maxScroll ?? 1_000_000;
  const scrollHeight = opts.scrollHeight ?? maxScroll + clientHeight;
  const anchorTop = opts.anchorTop ?? 0;
  const elementHeight = opts.elementHeight ?? 50;

  setWindowScrollMetrics(y, { clientHeight, scrollHeight });
  const top = anchorTop - y;
  anchor.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + elementHeight,
      left: 0,
      right: 0,
      width: 0,
      height: elementHeight,
      x: 0,
      y: top,
      toJSON() {},
    }) as DOMRect;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

/** Mocks document.documentElement clientWidth/clientHeight for viewport measurement tests. */
export function mockDocumentViewport(width: number, height: number): void {
  Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: () => width });
  Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: () => height });
}

/**
 * Selects an option from the Beam SelectField, MultiSelectField, and TreeSelectField components.
 *
 * For select fields that support multiple selections, subsequent calls to this function will toggle the selection state of an option.
 *
 * @param value The value or label of the option.
 * */
export function select(select: HTMLElement, value: string | string[]) {
  assertListBoxInput(select);
  ensureListBoxOpen(select);
  const optionValues = Array.isArray(value) ? value : [value];
  optionValues.forEach((optionValue) => selectOption(select, optionValue));
}

export type SelectAndWaitOpts = { addNew?: boolean };

/**
 * Selects an option from the Beam SelectField, MultiSelectField, and TreeSelectField components.
 *
 * When `value` is a single string and the listbox opens empty, types the value to trigger async
 * search before selecting. Multi-select (`value` array) assumes options are already loaded.
 *
 * When `{ addNew: true }`, types the value and selects the `Add "<value>"` creatable row.
 */
export async function selectAndWait(
  select: HTMLElement,
  value: string | string[],
  opts?: SelectAndWaitOpts,
): Promise<void> {
  // To work with React 18, we need to execute these as separate steps, otherwise
  // the `ensureListBoxOpen` async render won't flush, and the `selectOption` will fail.
  const optionValues = Array.isArray(value) ? value : [value];

  await allowAndWaitForAsyncBehavior(() => ensureListBoxOpen(select));
  if (opts?.addNew) {
    if (Array.isArray(value)) {
      throw new Error("selectAndWait addNew option does not support multi-select");
    }
    await typeForAddNew(select, value);
    return allowAndWaitForAsyncBehavior(() => selectOption(select, `Add "${value.trim()}"`));
  }
  if (!Array.isArray(value)) {
    await maybeAutoSearch(select, value);
  }

  return allowAndWaitForAsyncBehavior(() => {
    optionValues.forEach((optionValue) => selectOption(select, optionValue));
  });
}

async function typeForAddNew(select: HTMLElement, value: string): Promise<void> {
  fireEvent.input(select, { target: { value } });
  await _wait();
  await allowAndWaitForAsyncBehavior(() => ensureListBoxOpen(select));
}

/** When a combobox opens with no options, type the target label to trigger async search. */
async function maybeAutoSearch(select: HTMLElement, searchText: string): Promise<void> {
  if (!hasZeroOptions(select)) return;

  // Give lazy-load or debounced search a chance to populate options before typing.
  await _wait();
  await allowAndWaitForAsyncBehavior(() => ensureListBoxOpen(select));
  if (!hasZeroOptions(select)) return;

  fireEvent.input(select, { target: { value: searchText } });
  await _wait();
  await allowAndWaitForAsyncBehavior(() => ensureListBoxOpen(select));
}

function getListBoxOptions(select: HTMLElement): HTMLElement[] {
  const listbox = findListBox(select);
  return Array.from(listbox.querySelectorAll("[role=option]")) as HTMLElement[];
}

function hasZeroOptions(select: HTMLElement): boolean {
  return getListBoxOptions(select).length === 0;
}

function ensureListBoxOpen(select: HTMLElement): void {
  const expanded = select.getAttribute("aria-expanded") === "true";
  if (!expanded) {
    _click(select);
  }
}

function selectOption(select: HTMLElement, optionValue: string) {
  const listbox = findListBox(select);
  const options: NodeListOf<HTMLElement> = listbox.querySelectorAll("[role=option]");
  // Allow searching for options by their data-key (value) or textContent (label)
  const optionToSelect = Array.from(options).find(
    (o: HTMLElement) => o.dataset.key === optionValue || o.dataset.label === optionValue,
  );
  if (!optionToSelect) {
    throw new Error(`Could not find option with value or text content of ${optionValue}`);
  }
  if (optionToSelect.getAttribute("aria-disabled")) {
    throw new Error(`Cannot select disabled option ${optionValue}`);
  }
  _click(optionToSelect);
}

export function getSelected(select: HTMLElement): string[] | string | undefined {
  if (isSelectElement(select)) {
    throw new Error("Beam getSelected helper does not support <select> elements");
  }

  if (!isInputOrTextAreaElement(select) && select.dataset.readonly === "true") {
    // For read-only fields that render as a 'div'
    return select.textContent ?? undefined;
  }

  ensureListBoxOpen(select);

  const listbox = findListBox(select);
  const options: NodeListOf<HTMLElement> = listbox.querySelectorAll("[role=option]");

  const selections: string[] = Array.from(options)
    .filter((o: HTMLElement) => o.getAttribute("aria-selected") === "true")
    .map((o: HTMLElement) => o.dataset.label ?? o.dataset.key ?? "")
    // Filter out empty strings
    .filter((o) => !!o);

  return selections.length > 0 ? (selections.length > 1 ? selections : selections[0]) : undefined;
}

/** Returns option labels for a SelectField listbox, or a checkbox/radio group root. */
export function getOptions(element: HTMLElement): string[] {
  const group = resolveOptionGroup(element);
  if (group) return getGroupOptions(group);

  assertListBoxInput(element);
  ensureListBoxOpen(element);

  const listbox = findListBox(element);
  const options: NodeListOf<HTMLElement> = listbox.querySelectorAll("[role=option]");

  return Array.from(options)
    .map((o: HTMLElement) => o.dataset.label ?? o.dataset.key ?? "")
    .filter((o) => !!o);
}

/** Prefer the element itself when it is a group; otherwise look for a nested group. */
function resolveOptionGroup(element: HTMLElement): HTMLElement | undefined {
  if (isOptionGroup(element)) return element;
  const nested =
    element.querySelector<HTMLElement>('[role="radiogroup"]') ??
    Array.from(element.querySelectorAll<HTMLElement>('[role="group"]')).find(isCheckboxOrRadioGroup);
  return nested;
}

function isOptionGroup(element: HTMLElement): boolean {
  const role = element.getAttribute("role");
  if (role === "radiogroup") return true;
  return role === "group" && isCheckboxOrRadioGroup(element);
}

function isCheckboxOrRadioGroup(element: HTMLElement): boolean {
  return !!element.querySelector("input[type=checkbox], input[type=radio]");
}

function getGroupOptions(group: HTMLElement): string[] {
  const inputs = Array.from(group.querySelectorAll<HTMLInputElement>("input[type=radio], input[type=checkbox]"));
  return inputs.map(getInputOptionLabel).filter((label) => !!label);
}

function getInputOptionLabel(input: HTMLInputElement): string {
  const ariaLabel = input.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;

  const labelledBy = input.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy.split(/\s+/)[0]!);
    const text = labelEl?.textContent?.trim();
    if (text) return text;
  }

  return input.value || "";
}

function findListBox(select: HTMLElement): HTMLElement {
  if (select.tagName === "DIV") fail("SelectField is readOnly");
  const listboxId =
    select.getAttribute("aria-controls") ||
    fail("aria-controls attribute not found, the SelectField is probably readOnly");
  return document.getElementById(listboxId) || fail("listbox not found");
}

function assertListBoxInput(select: HTMLElement): select is HTMLInputElement | HTMLTextAreaElement {
  if (isSelectElement(select)) {
    throw new Error("Beam getOptions helper does not support <select> elements");
  }
  if (!isInputOrTextAreaElement(select)) {
    throw new Error(
      `Expected element to be INPUT or TEXTAREA, but got ${select.nodeName}. This field may be read-only. In that case we cannot get the list of options`,
    );
  }
  return true;
}

function isSelectElement(element: HTMLElement): element is HTMLSelectElement {
  return element.nodeName === "SELECT";
}

function isInputOrTextAreaElement(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
  return element.nodeName === "INPUT" || element.nodeName === "TEXTAREA";
}
