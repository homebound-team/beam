import { ButtonMenu, type MenuItem } from "src/components/ButtonMenu";
import { IconButton } from "src/components/IconButton";
import { PinToggle } from "src/components/Table/components/PinToggle";
import type { GridDataRow } from "src/components/Table/components/Row";
import type { GridRowAction, GridRowActionsConfig } from "src/components/Table/types";
import { rowActionGapPx, splitRowActions, tableIconInc } from "src/components/Table/utils/rowActions";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

/**
 * A `rowActionsColumn` cell: the row's actions and pin, the first few as icons and the rest in a "more" menu.
 *
 * The pin takes precedence over the actions: it's always an icon, right before the menu, and never moves into it.
 * The actions fill the icon slots before it, and the rest go in the menu.
 */
export function RowActionsCell({ row, config }: { row: GridDataRow<any>; config: GridRowActionsConfig }) {
  const { actions = [], pinnable = false } = config;
  const { sm } = useBreakpoint();
  // Up to 3 icons (the pin included, the menu not); phone-sized screens show only the pin and the menu
  const visibleCount = sm ? 0 : 3;
  const tid = useTestIds({});

  const { actionIcons } = splitRowActions(actions.length, pinnable, visibleCount);
  const iconActions = actions.slice(0, actionIcons);
  const menuItems = actions.slice(actionIcons).map(toMenuItem);

  if (actions.length === 0 && !pinnable) return null;
  return (
    <div css={Css.df.aic.jcfe.gapPx(rowActionGapPx).$}>
      {iconActions.map((action) => (
        <IconButton
          key={action.label}
          {...tid[`${defaultTestId(action.label)}_${row.id}`]}
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
          {...tid[`rowActions_${row.id}`]}
          trigger={{ icon: "verticalDots", inc: tableIconInc }}
          items={menuItems}
          placement="right"
        />
      )}
    </div>
  );
}

function toMenuItem(action: GridRowAction): MenuItem {
  const { label, icon, onClick, disabled, destructive } = action;
  return { label, icon, onClick, disabled, destructive };
}
