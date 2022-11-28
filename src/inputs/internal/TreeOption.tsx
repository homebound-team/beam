import { Node } from "@react-types/shared";
import { useCallback, useRef } from "react";
import { mergeProps, useHover, useOption } from "react-aria";
import { ListState, TreeState } from "react-stately";
import { Css, Palette } from "src/Css";
import { isPersistentKey } from "src/inputs/ChipSelectField";
import { noop } from "src/utils";
import { Checkbox } from "../Checkbox";

interface TreeOptionProps<O> {
  item: Node<[O, number]>;
  state: ListState<O> | TreeState<O>;
  contrast?: boolean;
  scrollToIndex?: (index: number) => void;
}
/** Represents a single option within a ListBox - used by SelectField, MultiSelectField, and TreeSelectField */
export function TreeOption<O>(props: TreeOptionProps<O>) {
  const { item, state, contrast = false, scrollToIndex } = props;
  const ref = useRef<HTMLLIElement>(null);
  const { hoverProps, isHovered } = useHover({});

  const themeStyles = {
    item: Css.gray900.if(contrast).white.$,
    hover: Css.bgGray100.if(contrast).bgGray600.$,
    disabled: Css.cursorNotAllowed.gray400.if(contrast).gray500.$,
    focus: Css.add("boxShadow", `inset 0 0 0 1px ${!contrast ? Palette.LightBlue700 : Palette.LightBlue500}`).$,
  };

  // Get props for the option element.
  // Prevent options from receiving browser focus via shouldUseVirtualFocus.
  // connection between listbox option element and select field
  const { optionProps, isDisabled, isFocused, isSelected } = useOption(
    { key: item.key, shouldSelectOnPressUp: true, shouldFocusOnHover: false },
    state,
    ref,
  );

  // Additional onKeyDown logic to ensure the virtualized list (in <VirtualizedOptions />) scrolls to keep the "focused" option in view
  // need to copy/paste this
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!scrollToIndex || !(e.key === "ArrowDown" || e.key === "ArrowUp")) {
        return;
      }

      const toKey = e.key === "ArrowDown" ? item.nextKey : item.prevKey;
      if (!toKey) {
        return;
      }

      const toItem = state.collection.getItem(toKey);
      // Only scroll the "options" (`state.collection` is a flat list of sections and items - we want to avoid scrolling to a "section" as it is not shown in the UI)
      if (
        toItem &&
        // Ensure we are only ever scrolling to an "option".
        (toItem.parentKey === "options" || (!toItem.parentKey && toItem.type === "item")) &&
        toItem.index !== undefined
      ) {
        scrollToIndex(toItem.index);
      }
    },
    [scrollToIndex, state],
  );
  console.log("item.level!", item.value[1]);

  // diff DOM structure, same hover/keydown props dont want same option props, treeoption component, new props
  // if the checkbox is selected, then we want to add it like the chips?
  return (
    <li
      {...mergeProps(optionProps, hoverProps, { onKeyDown })}
      ref={ref as any}
      css={{
        ...Css.df.aic.jcsb.py1.px2.mh("42px").outline0.cursorPointer.sm.plPx(item.value[1] * 8).$,
        // Assumes only one Persistent Item per list - will need to change to utilize Sections if that assumption is incorrect.
        ...(isPersistentKey(item.key) ? Css.bt.bGray200.$ : {}),
        ...themeStyles.item,
        ...(isHovered && !isDisabled ? themeStyles.hover : {}),
        ...(isFocused ? themeStyles.focus : {}),
        ...(isDisabled ? themeStyles.disabled : {}),
      }}
    >
      {/* need to swap out arrowRight for directional icon.*/}
      {/* onClick should change state of isExpanded to true and then once its true, render its children */}
      <span css={Css.df.jcsb.aic.w4.nowrap.$}>
        {/*<IconButton*/}
        {/*  icon={"arrowRight"}*/}
        {/*  inc={2}*/}
        {/*  onClick={() => {*/}
        {/*    console.log("hi");*/}
        {/*  }}*/}
        {/*/>*/}
        <Checkbox selected={isSelected} onChange={noop} checkboxOnly label={"test"} />
        {item.rendered}
      </span>
    </li>
  );
}
