import { useContext } from "react";
import { ButtonMenu, type MenuItem } from "src/components/ButtonMenu";
import { IconButton } from "src/components/IconButton";
import { PinToggle } from "src/components/Table/components/PinToggle";
import type { GridDataRow } from "src/components/Table/components/Row";
import type { GridRowAction } from "src/components/Table/GridTable";
import { type GridColumn, type Kinded, nonKindGridColumnKeys } from "src/components/Table/types";
import {
  beamRowActionsColumnId,
  rowActionGapPx,
  splitRowActions,
  tableIconInc,
} from "src/components/Table/utils/rowActions";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { emptyCell } from "src/components/Table/utils/utils";
import { Css } from "src/Css";
import { useComputed } from "src/hooks/useComputed";
import { newMethodMissingProxy } from "src/utils/useTestIds";

/**
 * A body row's `rowActions` and pin: the first few as icons, the rest in a "more" menu.
 *
 * The pin takes precedence over the actions: it's always an icon, right before the menu, and never moves into it.
 * The actions fill the icon slots before it, and the rest go in the menu.
 */
export function RowActionsCell({ row }: { row: GridDataRow<any> }) {
  const { tableState } = useContext(TableStateContext);
  const { actions, visibleCount, pinnable } = useComputed(
    () => ({
      actions: tableState.rowActionsFor(row.id),
      visibleCount: tableState.rowActionsVisibleCount,
      pinnable: tableState.isRowPinnable(row.id),
    }),
    [tableState, row.id],
  );

  const { actionIcons } = splitRowActions(actions.length, pinnable, visibleCount);
  const iconActions = actions.slice(0, actionIcons);
  const menuItems = actions.slice(actionIcons).map(toMenuItem);

  if (actions.length === 0 && !pinnable) return null;
  return (
    <div css={Css.df.aic.jcfe.gapPx(rowActionGapPx).$}>
      {iconActions.map((action) => (
        <IconButton
          key={action.label}
          data-testid={`${action.icon}_${row.id}`}
          icon={action.icon}
          label={action.label}
          onClick={action.onClick}
          disabled={action.disabled}
          inc={tableIconInc}
        />
      ))}
      {pinnable && <PinToggle rowId={row.id} />}
      {menuItems.length > 0 && (
        <ButtonMenu
          data-testid={`rowActions_${row.id}`}
          trigger={{ icon: "verticalDots", inc: tableIconInc }}
          items={menuItems}
          placement="right"
        />
      )}
    </div>
  );
}

/** The sticky-right column the table adds for `rowActions` and `rowPinning`; reserved rows get an empty cell. */
export function rowActionsColumn<T extends Kinded>(widthPx: number): GridColumn<T> {
  const base = {
    ...Object.fromEntries(nonKindGridColumnKeys.map((key) => [key, undefined])),
    id: beamRowActionsColumnId,
    clientSideSort: false,
    align: "right",
    sticky: "right",
    w: `${widthPx}px`,
    wrapAction: false,
    isAction: true,
    canHide: false,
    header: emptyCell,
    totals: emptyCell,
    expandableHeader: emptyCell,
    groupHeader: emptyCell,
  };
  return newMethodMissingProxy(base, () => (_data: unknown, { row }: { row: GridDataRow<T> }) => (
    <RowActionsCell row={row} />
  )) as GridColumn<T>;
}

function toMenuItem(action: GridRowAction): MenuItem {
  const { label, icon, onClick, disabled, destructive } = action;
  return { label, icon, onClick, disabled, destructive };
}
