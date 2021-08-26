import { Key, MutableRefObject, useState } from "react";
import { DismissButton, useListBox } from "react-aria";
import { SelectState } from "react-stately";
import { Virtuoso } from "react-virtuoso";
import { Chip } from "src/components/Chip";
import { Option } from "src/components/internal/index";
import { Css } from "src/Css";
import { BeamTheme } from "src/types";

interface ListBoxProps<O, V extends Key> {
  compact: boolean;
  listBoxRef: MutableRefObject<HTMLDivElement | null>;
  state: SelectState<O>;
  maxListHeight?: number;
  selectedOptions: O[];
  getOptionLabel: (opt: O) => string;
  getOptionValue: (opt: O) => V;
  theme?: BeamTheme;
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
    theme,
    ...otherProps
  } = props;
  const isDarkTheme = theme === BeamTheme.Dark;
  const { listBoxProps } = useListBox({ disallowEmptySelection: true, ...otherProps }, state, listBoxRef);

  const [listHeight, setListHeight] = useState(maxListHeight);
  const isMultiSelect = state.selectionManager.selectionMode === "multiple";

  return (
    <div
      css={{
        ...Css.mtPx(4).bgWhite.br4.w100.bshBasic.if(isDarkTheme).bgGray700.$,
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
          // We don't really need to set this, but it's handy for tests, which would
          // otherwise render just 1 row. A better way to do this would be to jest.mock
          // out Virtuoso with an impl that just rendered everything, but doing this for now.
          initialItemCount={3}
          itemContent={(idx) => {
            // MapIterator doesn't have at/index lookup so make a copy
            const keys = [...state.collection.getKeys()];
            const item = state.collection.getItem(keys[idx]);
            if (item) {
              return <Option key={item.key} item={item} state={state} theme={theme} />;
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
