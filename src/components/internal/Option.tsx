import { Node } from "@react-types/shared";
import React, { useRef } from "react";
import { useHover, useOption } from "react-aria";
import { ListState, TreeState } from "react-stately";
import { Icon } from "src/components/Icon";
import { Css, Palette } from "src/Css";

/** Represents a single option within a ListBox - used by SelectField and MultiSelectField */
export function Option<T>({ item, state }: { item: Node<T>; state: ListState<T> | TreeState<T> }) {
  const ref = useRef<HTMLLIElement>(null);
  const isDisabled = state.disabledKeys.has(item.key);
  const isSelected = state.selectionManager.isSelected(item.key);
  // Track focus via focusedKey state instead of with focus event listeners
  // since focus never leaves the text input in a ComboBox
  const isFocused = state.selectionManager.focusedKey === item.key;
  const { hoverProps, isHovered } = useHover({});

  // Get props for the option element.
  // Prevent options from receiving browser focus via shouldUseVirtualFocus.
  const { optionProps } = useOption(
    {
      key: item.key,
      isDisabled,
      isSelected,
      // If this is true, then a user can: 1) press down to open the select menu,
      // 2) have the menu drawn under their mouse cursor, 3) release their press
      // and useSelectableItem will fire onPress/select and cause the
      // accidentally-selected item to be added to the list.
      shouldSelectOnPressUp: false,
      shouldFocusOnHover: true,
      shouldUseVirtualFocus: true,
    },
    state,
    ref,
  );

  return (
    <li
      {...optionProps}
      {...hoverProps}
      ref={ref as any}
      css={{
        ...Css.df.itemsCenter.justifyBetween.py1.px2.mh("42px").cursorPointer.gray900.sm.$,
        ...(isHovered ? Css.bgGray100.$ : {}),
        ...(isFocused ? Css.add("boxShadow", `inset 0 0 0 1px ${Palette.LightBlue700}`).$ : {}),
      }}
    >
      {item.rendered}
      {isSelected && (
        <span css={Css.fs0.$}>
          <Icon icon="check" color={Palette.LightBlue700} />
        </span>
      )}
    </li>
  );
}
