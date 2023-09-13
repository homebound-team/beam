import React, { Key, MutableRefObject, useEffect, useRef, useState } from "react";
import { useListBox } from "react-aria";
import { SelectState } from "react-stately";
import { Css } from "src/Css";
import { persistentItemHeight, sectionSeparatorHeight } from "src/inputs/internal/constants";
import { ListBoxSection } from "src/inputs/internal/ListBoxSection";
import { ListBoxToggleChip } from "src/inputs/internal/ListBoxToggleChip";
import { VirtualizedOptions } from "src/inputs/internal/VirtualizedOptions";

interface ListBoxProps<O, V extends Key> {
  listBoxRef: MutableRefObject<HTMLDivElement | null>;
  state: SelectState<O>;
  selectedOptions?: O[];
  getOptionLabel: (opt: O) => string;
  getOptionValue: (opt: O) => V;
  contrast?: boolean;
  horizontalLayout?: boolean;
  positionProps: React.HTMLAttributes<Element>;
  loading?: boolean | (() => JSX.Element);
  disabledOptionsWithReasons?: Record<string, string | undefined>;
  isTree?: boolean;
  allowCollapsing?: boolean;
}

/** A ListBox is an internal component used by SelectField and MultiSelectField to display the list of options */
export function ListBox<O, V extends Key>(props: ListBoxProps<O, V>) {
  const {
    state,
    listBoxRef,
    selectedOptions = [],
    getOptionLabel,
    getOptionValue,
    contrast = false,
    positionProps,
    horizontalLayout = false,
    loading,
    disabledOptionsWithReasons = {},
    isTree,
    allowCollapsing,
  } = props;
  const { listBoxProps } = useListBox({ disallowEmptySelection: true, ...props }, state, listBoxRef);
  const positionMaxHeight = positionProps.style?.maxHeight;
  // The popoverMaxHeight will be based on the value defined by the positionProps returned from `useOverlayPosition` (which will always be a defined as a `number` based on React-Aria's `calculatePosition`).
  // If `maxHeight` is set use that, otherwise use `maxPopoverHeight` as a default, per UX guidelines.
  // (`positionMaxHeight` should always be set and defined as a number, but we need to do these type checks to make TS happy)
  const popoverMaxHeight =
    positionMaxHeight && typeof positionMaxHeight === "number"
      ? Math.min(positionMaxHeight, maxPopoverHeight)
      : maxPopoverHeight;
  const [popoverHeight, setPopoverHeight] = useState(popoverMaxHeight);
  const isMultiSelect = state.selectionManager.selectionMode === "multiple";
  const firstItem = state.collection.at(0);
  const hasSections = firstItem && firstItem.type === "section";
  // Create a reference for measuring the MultiSelect's selected list's height. Used for re-evaluating `popoverHeight`.
  const selectedList = useRef<HTMLUListElement>(null);
  const firstRender = useRef(true);
  // Keep track of the virtuoso list height to properly update the ListBox's height.
  // Using a ref, this itself should not trigger a rerender, only `popoverHeight` changes will trigger a rerender.
  const virtuosoListHeight = useRef<number>(0);
  const onListHeightChange = (listHeight: number) => {
    virtuosoListHeight.current = listHeight;
    // The "listHeight" is only the list of options.
    // For multiple selects we need to also account for the height of the list of currently selected elements when re-evaluating.
    // Using `offsetHeight` to account for borders
    const height = (selectedList.current?.offsetHeight || 0) + listHeight;

    // Using Math.min to choose between the smaller height, either the total height of the List (`height` arg), or the maximum height defined by the space allotted on screen or our hard coded max.
    // If there are ListBoxSections, then we assume it is the persistent section with a single item and account for that height.
    setPopoverHeight(
      Math.min(popoverMaxHeight, hasSections ? height + persistentItemHeight + sectionSeparatorHeight : height),
    );
  };

  useEffect(
    () => {
      // Reevaluate the list height when introducing or removing the MultiSelect's options list.
      // Do not call `onListHeightChange` on the first render. Only when the selectedKeys size has actually changed between empty and not empty.
      if (
        !firstRender.current &&
        isMultiSelect &&
        (state.selectionManager.selectedKeys.size === 0 || state.selectionManager.selectedKeys.size === 1)
      ) {
        onListHeightChange(virtuosoListHeight.current);
      }
      firstRender.current = false;
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-internal-frontend
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.selectionManager.selectedKeys.size],
  );

  return (
    <div
      css={{
        // If `horizontalLayout`, then that means `labelStyle === "left"`. In this case the label the the field both take 50% of the horizontal space.
        // Add `w50` in that case to ensure the ListBox is only the width of the field. If the width definitions ever change, we need to update here as well.
        ...Css.bgWhite.br4.w100.bshBasic.hPx(popoverHeight).df.fdc.if(contrast).bgGray700.if(horizontalLayout).w50.$,
        "&:hover": Css.bshHover.$,
      }}
      ref={listBoxRef}
      {...listBoxProps}
    >
      {isMultiSelect && !isTree && state.selectionManager.selectedKeys.size > 0 && (
        <ul
          css={Css.listReset.pt2.pl2.pb1.pr1.df.bb.bGray200.add("flexWrap", "wrap").maxh("50%").overflowAuto.$}
          ref={selectedList}
        >
          {selectedOptions.map((o) => (
            <ListBoxToggleChip
              key={getOptionValue(o)}
              state={state}
              option={o}
              getOptionValue={getOptionValue}
              getOptionLabel={getOptionLabel}
              disabled={state.disabledKeys.has(getOptionValue(o))}
            />
          ))}
        </ul>
      )}

      <ul css={Css.listReset.fg1.$}>
        {hasSections ? (
          [...state.collection].map((section) => (
            <ListBoxSection
              key={section.key}
              section={section}
              state={state}
              contrast={contrast}
              onListHeightChange={onListHeightChange}
              popoverHeight={popoverHeight}
              // Only scroll on focus if using VirtualFocus (used for ComboBoxState (SelectField), but not SelectState (ChipSelectField))
              scrollOnFocus={(props as any).shouldUseVirtualFocus}
              disabledOptionsWithReasons={disabledOptionsWithReasons}
            />
          ))
        ) : (
          <VirtualizedOptions
            state={state}
            items={[...state.collection]}
            onListHeightChange={onListHeightChange}
            contrast={contrast}
            // Only scroll on focus if using VirtualFocus (used for ComboBoxState (SelectField), but not SelectState (ChipSelectField))
            scrollOnFocus={(props as any).shouldUseVirtualFocus}
            loading={loading}
            disabledOptionsWithReasons={disabledOptionsWithReasons}
            isTree={isTree}
            allowCollapsing={allowCollapsing}
          />
        )}
      </ul>
    </div>
  );
}

// UX specified maximum height for a ListBox (in pixels)
const maxPopoverHeight = 512;
