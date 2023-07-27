import { makeAutoObservable, observable } from "mobx";
import { GridDataRow, SelectedState } from "src";
import { RowState } from "src/components/Table/components/RowState";
import { RowStates } from "src/components/Table/components/RowStates";

export class HeaderState implements RowState {
  children = undefined;
  isMatched = true;
  parent = undefined;
  row: GridDataRow<any>;
  selected = false;
  wasRemoved = false;

  constructor(rowStates: RowStates, row: GridDataRow<any>) {
    this.row = row;
    makeAutoObservable(this, { row: observable.ref });
  }

  get isKept(): boolean {
    return false;
  }

  get isSelected(): boolean {
    return this.selected;
  }

  get selectedState(): SelectedState {
    return this.selected ? "checked" : "unchecked";
  }
}
