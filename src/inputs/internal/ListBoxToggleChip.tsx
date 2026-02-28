import { Key as AriaKey } from "@react-types/shared";
// react-aria >= 3.35: Use ListState instead of SelectState as the shared base type.
// Also use AriaKey (string | number) instead of React.Key (string | number | bigint).
import { ListState } from "react-stately";
import { ToggleChip } from "src/components";
import { Css } from "src/Css";

interface ListBoxToggleChipProps<O, V extends AriaKey> {
  state: ListState<O>;
  option: O;
  getOptionLabel: (opt: O) => string;
  getOptionValue: (opt: O) => V;
  disabled?: boolean;
}

/** Chip used to display selections within ListBox when using the MultiSelectField */
export function ListBoxToggleChip<O, V extends AriaKey>(props: ListBoxToggleChipProps<O, V>) {
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
