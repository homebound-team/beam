import { SelectState } from "@react-stately/select";
import React, { Key, MutableRefObject, useState } from "react";
import { DismissButton, useListBox } from "react-aria";
import { Virtuoso } from "react-virtuoso";
import { Icon } from "src/components/Icon";
import { Option } from "src/components/Option";
import { Css } from "src/Css";

interface ListBoxProps<O extends object, V extends Key> {
  compact: boolean;
  listBoxRef: MutableRefObject<HTMLUListElement | null>;
  state: SelectState<O>;
  maxListHeight?: number;
  selectedOptions: O[];
  getOptionLabel: (opt: O) => string;
  getOptionValue: (opt: O) => V;
}

export function ListBox<O extends object, V extends Key>(props: ListBoxProps<O, V>) {
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
    >
      {isMultiSelect && state.selectionManager.selectedKeys.size > 0 && (
        <ul css={Css.pt2.pl2.pb1.pr1.df.bb.bGray200.add("flexWrap", "wrap").$}>
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
      <ul style={{ height: Math.min(maxListHeight, listHeight) }} ref={listBoxRef} {...listBoxProps}>
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

interface ListBoxChipProps<O extends object, V extends Key> {
  state: SelectState<O>;
  option: O;
  getOptionLabel: (opt: O) => string;
  getOptionValue: (opt: O) => V;
}

function ListBoxChip<O extends object, V extends Key>(props: ListBoxChipProps<O, V>) {
  const { state, option, getOptionLabel, getOptionValue } = props;
  return (
    <li css={Css.mr1.mb1.$}>
      <button
        type="button"
        css={{
          ...Css.df.itemsCenter.br16.sm.pl1.pyPx(2).bgGray200.$,
          ":hover": Css.bgGray300.$,
        }}
        onClick={() => {
          state.selectionManager.toggleSelection(String(getOptionValue(option)));
        }}
      >
        <span css={Css.prPx(6).$}>{getOptionLabel(option)}</span>
        <span css={Css.fs0.br16.bgGray400.mrPx(2).$}>
          <Icon icon="x" />
        </span>
      </button>
    </li>
  );
}
