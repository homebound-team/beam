import { reaction } from "mobx";
import { Kinded } from "src/components/Table/types";
import { type PageSessionStorage, loadSessionStorageJson } from "src/hooks/usePageSessionStorage";
import { ColumnState } from "src/components/Table/utils/ColumnState";
import { ColumnStates } from "src/components/Table/utils/ColumnStates";

/** Loads/saves the column state from sessionStorage. */
export class ColumnStorage<R extends Kinded> {
  private expandedById: Record<string, boolean> | undefined;
  private visibleById: Record<string, boolean> | undefined;
  private expandedStorageKey: string | undefined;
  private visibleStorageKey: string | undefined;
  private persistExpandedColumns: (() => void) | undefined;
  private persistVisibleColumns: (() => void) | undefined;

  constructor(private states: ColumnStates<R>) {}

  loadExpanded(storage: PageSessionStorage): void {
    if (this.expandedStorageKey === storage.key) return;

    this.persistExpandedColumns?.();
    this.expandedStorageKey = storage.key;
    this.expandedById = loadBooleanRecordOrUndefined(storage);
    this.persistExpandedColumns = reaction(
      () => JSON.stringify(getExpandedOverrides(this.states.allColumns)),
      (serialized) => storage.setItem(serialized),
    );
  }

  loadVisible(storage: PageSessionStorage): void {
    if (this.visibleStorageKey === storage.key) return;

    this.persistVisibleColumns?.();
    this.visibleStorageKey = storage.key;
    this.visibleById = loadBooleanRecordOrUndefined(storage);
    this.persistVisibleColumns = reaction(
      () => JSON.stringify(getVisibleOverrides(this.states.allColumns)),
      (serialized) => storage.setItem(serialized),
    );
  }

  wasExpanded(id: string): boolean | undefined {
    return this.expandedById?.[id];
  }

  wasVisible(id: string): boolean | undefined {
    return this.visibleById?.[id];
  }
}

function loadBooleanRecordOrUndefined(storage: PageSessionStorage): Record<string, boolean> | undefined {
  const parsed = loadSessionStorageJson<unknown>(storage);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return undefined;
  }

  const entries = Object.entries(parsed);
  if (entries.every((entry) => typeof entry[1] === "boolean")) {
    return Object.fromEntries(entries) as Record<string, boolean>;
  }

  storage.removeItem();
  return undefined;
}

function getExpandedOverrides<R extends Kinded>(columns: ColumnState<R>[]): Record<string, boolean> {
  return Object.fromEntries(
    columns
      .filter((cs) => cs.isExpanded !== !!cs.column.initExpanded)
      .map((cs) => [cs.column.id, cs.isExpanded]),
  );
}

function getVisibleOverrides<R extends Kinded>(columns: ColumnState<R>[]): Record<string, boolean> {
  return Object.fromEntries(
    columns
      .filter((cs) => cs.column.canHide)
      .filter((cs) => cs.isVisible !== isVisibleByDefault(cs))
      .map((cs) => [cs.column.id, cs.isVisible]),
  );
}

function isVisibleByDefault<R extends Kinded>(columnState: ColumnState<R>): boolean {
  const { column } = columnState;
  return column.canHide ? !(column.initHidden ?? true) : true;
}
