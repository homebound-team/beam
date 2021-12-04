import { Node } from "@react-types/shared";
import React from "react";
import { useListBoxSection, useSeparator } from "react-aria";
import { SelectState } from "react-stately";
import { Css } from "src/Css";
import { persistentItemHeight, sectionSeparatorHeight } from "src/inputs/internal/constants";
import { Option } from "src/inputs/internal/Option";
import { VirtualizedOptions } from "src/inputs/internal/VirtualizedOptions";

interface ListBoxSectionProps<O> {
  section: Node<O>;
  state: SelectState<O>;
  contrast: boolean;
  onListHeightChange: (height: number) => void;
  popoverHeight: number;
  scrollOnFocus?: boolean;
}

// Creates a section of options within a ListBox.
// Currently only expects two possible sections; 1. The list of options, and 2. A persistent action (in that order).
export function ListBoxSection<O>(props: ListBoxSectionProps<O>) {
  const { section, state, contrast, onListHeightChange, popoverHeight, scrollOnFocus } = props;
  const { itemProps, groupProps } = useListBoxSection(section);
  const { separatorProps } = useSeparator({ elementType: "li" });
  const isPersistentSection = section.key !== state.collection.getFirstKey();
  const childNodes = [...section.childNodes];

  return (
    <>
      {isPersistentSection && <li {...separatorProps} css={Css.bt.bGray200.$} />}
      <li {...itemProps} css={Css.if(!isPersistentSection).overflowAuto.$}>
        {/* Styles assume only one Persistent Item is ever shown. Will need to adjust if that ever changes */}
        <ul
          css={
            Css.listReset.if(!isPersistentSection).hPx(popoverHeight - sectionSeparatorHeight - persistentItemHeight).$
          }
          {...groupProps}
        >
          {isPersistentSection ? (
            childNodes.map((item) => <Option key={item.key} item={item} state={state} contrast={contrast} />)
          ) : (
            <VirtualizedOptions
              state={state}
              items={childNodes}
              onListHeightChange={onListHeightChange}
              contrast={contrast}
              scrollOnFocus={scrollOnFocus}
            />
          )}
        </ul>
      </li>
    </>
  );
}
