import { useContext } from "react";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { useComputed } from "src/hooks";
import { Checkbox } from "src/inputs";

interface SelectToggleProps {
  id: string;
  disabled?: boolean;
}

/** Provides a checkbox to show/drive this row's selected state. */
export function SelectToggle({ id, disabled }: SelectToggleProps) {
  const { tableState } = useContext(TableStateContext);
  const state = useComputed(() => tableState.getSelected(id), [tableState]);
  const selected = state === "checked" ? true : state === "unchecked" ? false : "indeterminate";

  return (
    <Checkbox
      checkboxOnly={true}
      disabled={disabled}
      label="Select"
      onChange={(selected) => {
        tableState.selectRow(id, selected);
      }}
      selected={selected}
    />
  );
}
