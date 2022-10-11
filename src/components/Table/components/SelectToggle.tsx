import React, { useContext } from "react";
import { RowStateContext } from "src/components/Table/utils/RowState";
import { useComputed } from "src/hooks";
import { Checkbox } from "src/inputs";

interface SelectToggleProps {
  id: string;
  disabled?: boolean;
}

/** Provides a checkbox to show/drive this row's selected state. */
export function SelectToggle({ id, disabled }: SelectToggleProps) {
  const { rowState } = useContext(RowStateContext);
  const state = useComputed(() => rowState.getSelected(id), [rowState]);
  const selected = state === "checked" ? true : state === "unchecked" ? false : "indeterminate";

  return (
    <Checkbox
      checkboxOnly={true}
      disabled={disabled}
      label="Select"
      onChange={(selected) => {
        rowState.selectRow(id, selected);
      }}
      selected={selected}
    />
  );
}
