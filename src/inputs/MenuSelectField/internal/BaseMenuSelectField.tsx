import type { JSX } from "react";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { AnchoredOverlay } from "src/inputs/MenuSelectField/internal/AnchoredOverlay";
import { BottomSheet } from "src/inputs/MenuSelectField/internal/BottomSheet";
import { MenuPanel } from "src/inputs/MenuSelectField/internal/MenuPanel";
import { MenuSearchInput } from "src/inputs/MenuSelectField/internal/MenuSearchInput";
import { MenuSelectTrigger } from "src/inputs/MenuSelectField/internal/MenuSelectTrigger";
import { OptionList } from "src/inputs/MenuSelectField/internal/OptionList";
import { useMenuSelectField } from "src/inputs/MenuSelectField/internal/useMenuSelectField";
import type { MenuSelectControllerProps } from "src/inputs/MenuSelectField/types";
import type { Value } from "src/inputs/Value";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

/** Shared menu for `MenuSelectField`, `MenuMultiSelectField`, and `MenuTreeSelectField`. Desktop popover; small screens a bottom sheet. */
export function BaseMenuSelectField<O, V extends Value>(props: MenuSelectControllerProps<O, V>): JSX.Element {
  const {
    label,
    searchPlaceholder,
    selectionMode: _selectionMode,
    values: _values,
    proposedValues: _proposedValues,
    onCommit: _onCommit,
    tree: _tree,
    ...fieldProps
  } = props;
  const { triggerRef, trigger, searchRef, search, listRef, menu, selections } = useMenuSelectField(props);
  const tid = useTestIds(props, defaultTestId(label));
  const { sm: isMobile } = useBreakpoint();
  const panel = (
    <MenuPanel
      variant={isMobile ? "sheet" : "anchored"}
      selections={selections}
      header={
        search.show ? (
          <MenuSearchInput
            search={search}
            inputRef={searchRef}
            label={`Search ${label}`}
            placeholder={searchPlaceholder}
            {...tid}
          />
        ) : undefined
      }
      {...tid}
    >
      <OptionList
        menu={menu}
        listRef={listRef}
        label={label}
        onKeyDown={search.show ? undefined : menu.onKeyDown}
        activeDescendant={search.show ? undefined : menu.activeDescendant}
        {...tid}
      />
    </MenuPanel>
  );

  return (
    <>
      <MenuSelectTrigger {...fieldProps} label={label} trigger={trigger} triggerRef={triggerRef} />
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
