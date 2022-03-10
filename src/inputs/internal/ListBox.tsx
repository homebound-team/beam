import React, { Key, MutableRefObject, useState } from "react";
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
  positionProps: React.HTMLAttributes<Element>;
  loading?: boolean | (() => JSX.Element);
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
    loading,
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
  const onListHeightChange = (height: number) => {
    // Using Math.min to choose between the smaller height, either the total height of the List (`height` arg), or the maximum height defined by the space allotted on screen or our hard coded max.
    // If there are ListBoxSections, then we assume it is the persistent section with a single item and account for that height.
    setPopoverHeight(
      Math.min(popoverMaxHeight, hasSections ? height + persistentItemHeight + sectionSeparatorHeight : height),
    );
  };

  return (
    <div
      css={{
        ...Css.bgWhite.br4.w100.bshBasic.if(contrast).bgGray700.$,
        "&:hover": Css.bshHover.$,
      }}
      ref={listBoxRef}
      {...listBoxProps}
    >
      {isMultiSelect && state.selectionManager.selectedKeys.size > 0 && (
        <ul css={Css.listReset.pt2.pl2.pb1.pr1.df.bb.bGray200.add("flexWrap", "wrap").$}>
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

      <ul css={Css.listReset.hPx(popoverHeight).$}>
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
          />
        )}
      </ul>
    </div>
  );
}

// UX specified maximum height for a ListBox (in pixels)
const maxPopoverHeight = 512;
