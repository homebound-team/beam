import { useContext } from "react";
import { IconButton } from "src/components/IconButton";
import { tableIconInc } from "src/components/Table/utils/rowActions";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { Palette, Tokens } from "src/Css";
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
  const pinnedState = useComputed(() => tableState.isPinnedRow(rowId), [tableState, rowId]);
  // A child of a pinned parent moves with it, so it can't be unpinned on its own
  const viaParent = pinnedState === "parent";
  const tid = useTestIds({}, "pinToggle");
  return (
    <IconButton
      {...tid}
      icon={pinnedState ? "pinFilled" : "pin"}
      inc={tableIconInc}
      color={pinnedState ? Tokens.Primary : undefined}
      label={pinnedState ? "Unpin row" : "Pin row"}
      disabled={viaParent ? "Pinned with parent" : undefined}
      // Show the pinned row fill through, not the default grey disabled background
      bgColor={viaParent ? Palette.Transparent : undefined}
      onClick={() => tableState.togglePinned(rowId)}
    />
  );
}
