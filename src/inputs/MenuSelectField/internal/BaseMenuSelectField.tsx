import type { JSX } from "react";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { AnchoredOverlay } from "src/inputs/MenuSelectField/internal/AnchoredOverlay";
import { BottomSheet } from "src/inputs/MenuSelectField/internal/BottomSheet";
import { MenuPanel } from "src/inputs/MenuSelectField/internal/MenuPanel";
import { MenuSearchInput } from "src/inputs/MenuSelectField/internal/MenuSearchInput";
import { MenuSelectTrigger } from "src/inputs/MenuSelectField/internal/MenuSelectTrigger";
import { OptionList } from "src/inputs/MenuSelectField/internal/OptionList";
import {
  useMenuSelectController,
  type MenuSelectControllerProps,
} from "src/inputs/MenuSelectField/internal/useMenuSelectController";
import type { Value } from "src/inputs/Value";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

/** Menu select implementation. Desktop popover; small screens a bottom sheet. */
export function BaseMenuSelectField<O, V extends Value>(props: MenuSelectControllerProps<O, V>): JSX.Element {
  const { label, searchPlaceholder } = props;
  const { triggerRef, searchRef, listRef, field: menu } = useMenuSelectController(props);
  const tid = useTestIds(props, defaultTestId(label));
  const { sm: isMobile } = useBreakpoint();
  const panel = (
    <MenuPanel
      variant={isMobile ? "sheet" : "anchored"}
      header={
        menu.showSearch ? (
          <MenuSearchInput
            value={menu.search}
            onChange={menu.onSearchChange}
            inputRef={searchRef}
            label={`Search ${label}`}
            placeholder={searchPlaceholder}
            listId={menu.listId}
            activeDescendant={menu.activeDescendant}
            onKeyDown={menu.onMenuKeyDown}
            {...tid}
          />
        ) : undefined
      }
      {...tid}
    >
      <OptionList
        state={menu.state}
        listRef={listRef}
        id={menu.listId}
        label={label}
        loading={menu.optionsLoading}
        disabledReasons={menu.disabledReasons}
        initialIndex={menu.initialIndex}
        onKeyDown={menu.showSearch ? undefined : menu.onMenuKeyDown}
        activeDescendant={menu.showSearch ? undefined : menu.activeDescendant}
        {...tid}
      />
    </MenuPanel>
  );

  return (
    <>
      <MenuSelectTrigger {...props} menu={menu} triggerRef={triggerRef} />
      {isMobile ? (
        <BottomSheet isOpen={menu.isOpen} onClose={() => menu.close({ restoreFocus: true })} label={label} {...tid}>
          {panel}
        </BottomSheet>
      ) : (
        <AnchoredOverlay
          triggerRef={triggerRef}
          isOpen={menu.isOpen}
          onClose={() => menu.close({ restoreFocus: false })}
          {...tid}
        >
          {panel}
        </AnchoredOverlay>
      )}
    </>
  );
}
