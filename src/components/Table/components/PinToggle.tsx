import { useContext } from "react";
import { IconButton } from "src/components/IconButton";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { Palette } from "src/Css";
import { useComputed } from "src/hooks";
import { useTestIds } from "src/utils";

type PinToggleProps = {
  rowId: string;
};

/**
 * Provides a pin icon to pin/unpin a row to the top of the table at runtime.
 *
 * The pinned row is hoisted into a sticky pinned section that stays visible while the body scrolls.
 */
export function PinToggle({ rowId }: PinToggleProps) {
  const { tableState } = useContext(TableStateContext);
  const isPinned = useComputed(() => tableState.isPinnedRow(rowId), [tableState, rowId]);
  const tid = useTestIds({}, "pin");
  return (
    <IconButton
      {...tid[rowId]}
      icon="pin"
      bgColor={isPinned ? Palette.Green300 : undefined}
      label={isPinned ? "Unpin row" : "Pin row"}
      onClick={() => tableState.togglePinned(rowId)}
    />
  );
}
