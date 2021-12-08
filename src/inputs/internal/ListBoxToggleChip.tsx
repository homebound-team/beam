import React, { Key } from "react";
import { SelectState } from "react-stately";
import { ToggleChip } from "src/components";
import { Css } from "src/Css";

interface ListBoxToggleChipProps<O, V extends Key> {
  state: SelectState<O>;
  option: O;
  getOptionLabel: (opt: O) => string;
  getOptionValue: (opt: O) => V;
  disabled?: boolean;
}

/** Chip used to display selections within ListBox when using the MultiSelectField */
export function ListBoxToggleChip<O, V extends Key>(props: ListBoxToggleChipProps<O, V>) {
  const { state, option, getOptionLabel, getOptionValue, disabled = false } = props;
  return (
    <li css={Css.mr1.mb1.$}>
      <ToggleChip
        text={getOptionLabel(option)}
        onClick={() => {
          state.selectionManager.toggleSelection(String(getOptionValue(option)));
        }}
        disabled={disabled}
      />
    </li>
  );
}
