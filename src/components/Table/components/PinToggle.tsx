import { useContext } from "react";
import { IconButton } from "src/components/IconButton";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { Palette } from "src/Css";
import { useComputed } from "src/hooks";
import { useTestIds } from "src/utils";

type PinToggleProps = {
  id: string;
};

/**
 * Provides a pin icon to pin/unpin a row to the top of the table at runtime.
 *
 * The pinned row is hoisted into a sticky pinned section that stays visible while the body scrolls.
 */
export function PinToggle({ id }: PinToggleProps) {
  const { tableState } = useContext(TableStateContext);
  const isPinned = useComputed(() => tableState.isPinnedRow(id), [tableState, id]);
  const tid = useTestIds({}, "pin");
  return (
    <IconButton
      {...tid[id]}
      icon="pin"
      bgColor={isPinned ? Palette.Green300 : undefined}
      label={isPinned ? "Unpin row" : "Pin row"}
      onClick={() => tableState.togglePinned(id)}
    />
  );
}
