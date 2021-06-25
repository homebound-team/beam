import { SelectState } from "@react-stately/select";
import React, { Key, MutableRefObject, useState } from "react";
import { DismissButton, useListBox } from "react-aria";
import { Virtuoso } from "react-virtuoso";
import { Chip } from "src/components/Chip";
import { Option } from "src/components/internal";
import { Css } from "src/Css";

interface ListBoxProps<O, V extends Key> {
  compact: boolean;
  listBoxRef: MutableRefObject<HTMLDivElement | null>;
  state: SelectState<O>;
  maxListHeight?: number;
  selectedOptions: O[];
  getOptionLabel: (opt: O) => string;
  getOptionValue: (opt: O) => V;
}

/** A ListBox is an internal component used by SelectField and MultiSelectField to display the list of options */
export function ListBox<O, V extends Key>(props: ListBoxProps<O, V>) {
  const {
    state,
    compact,
    listBoxRef,
    // Choosing `273` as a defined max-height. `42px` is the min-height of each option, so this allows
    // 6.5 options in view at a time (doing `.5` so the user can easily tell if there are more).
    maxListHeight = 273,
    selectedOptions,
    getOptionLabel,
    getOptionValue,
    ...otherProps
  } = props;
  const { listBoxProps } = useListBox({ disallowEmptySelection: true, ...otherProps }, state, listBoxRef);

  const [listHeight, setListHeight] = useState(maxListHeight);
  const isMultiSelect = state.selectionManager.selectionMode === "multiple";

  return (
    <div
      css={{
        ...Css.mtPx(4).bgWhite.br4.w100.bshBasic.$,
        "&:hover": Css.bshHover.$,
      }}
      ref={listBoxRef}
      {...listBoxProps}
    >
      {isMultiSelect && state.selectionManager.selectedKeys.size > 0 && (
        <ul css={Css.listReset.pt2.pl2.pb1.pr1.df.bb.bGray200.add("flexWrap", "wrap").$}>
          {selectedOptions.map((o) => (
            <ListBoxChip
              key={getOptionValue(o)}
              state={state}
              option={o}
              getOptionValue={getOptionValue}
              getOptionLabel={getOptionLabel}
            />
          ))}
        </ul>
      )}
      <ul css={Css.listReset.hPx(Math.min(maxListHeight, listHeight)).$}>
        <Virtuoso
          totalListHeightChanged={setListHeight}
          totalCount={state.collection.size}
          itemContent={(idx) => {
            // MapIterator doesn't have at/index lookup so make a copy
            const keys = [...state.collection.getKeys()];
            const item = state.collection.getItem(keys[idx]);
            if (item) {
              return <Option key={item.key} item={item} state={state} />;
            }
          }}
        />
      </ul>
      <DismissButton onDismiss={() => state.close()} />
    </div>
  );
}

interface ListBoxChipProps<O, V extends Key> {
  state: SelectState<O>;
  option: O;
  getOptionLabel: (opt: O) => string;
  getOptionValue: (opt: O) => V;
}

/** Chip used to display selections within ListBox when using the MultiSelectField */
function ListBoxChip<O, V extends Key>(props: ListBoxChipProps<O, V>) {
  const { state, option, getOptionLabel, getOptionValue } = props;
  return (
    <li css={Css.mr1.mb1.$}>
      <Chip
        text={getOptionLabel(option)}
        onClick={() => {
          state.selectionManager.toggleSelection(String(getOptionValue(option)));
        }}
      />
    </li>
  );
}
