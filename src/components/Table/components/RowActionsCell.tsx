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
 * A `rowActionsColumn` cell: the row's actions and pin, the first few as icons and the rest in an "overflow" menu.
 *
 * The pin takes precedence over the actions: it's always an icon, right before the menu, and never moves into it.
 * The actions fill the icon slots before it, and the rest (and any `overflowOnly` ones) go in the menu, unless
 * there's only one left over, which shows as an icon in the menu's place.
 */
export function RowActionsCell(props: { row: GridDataRow<any>; config: GridRowActionsConfig; pinnable: boolean }) {
  const { row, config, pinnable } = props;
  const { actions = [] } = config;
  const { sm } = useBreakpoint();
  // Up to 2 icons (the pin included) before the menu, 3 buttons in all; phone-sized screens show only the pin and the menu
  const visibleCount = sm ? 0 : 2;
  const tid = useTestIds({});

  const { icons: iconActions, menu } = splitRowActions(actions, pinnable, visibleCount);
  const menuItems = menu.map(toMenuItem);

  if (actions.length === 0 && !pinnable) return null;
  return (
    <div css={Css.df.aic.jcfe.gapPx(rowActionGapPx).$}>
      {iconActions.map((action) => (
        <IconButton
          key={action.label}
          {...tid[defaultTestId(action.label)]}
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
          {...tid.rowActions}
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
