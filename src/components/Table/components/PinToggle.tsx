import { useContext } from "react";
import { IconButton } from "src/components/IconButton";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { Tokens } from "src/Css";
import { useComputed } from "src/hooks/useComputed";
import { useTestIds } from "src/utils/useTestIds";

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
  // A child of a pinned parent moves with it, so it can't be unpinned on its own
  const isPinnedViaParent = useComputed(() => tableState.isPinnedViaParent(rowId), [tableState, rowId]);
  const tid = useTestIds({}, "pin");
  return (
    <IconButton
      {...tid[rowId]}
      icon="pin"
      color={isPinned || isPinnedViaParent ? Tokens.Primary : undefined}
      label={isPinned ? "Unpin row" : "Pin row"}
      disabled={isPinnedViaParent ? "Pinned with parent" : undefined}
      onClick={() => tableState.togglePinned(rowId)}
    />
  );
}
