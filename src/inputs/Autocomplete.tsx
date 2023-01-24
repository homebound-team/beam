import { Key, ReactNode, useRef } from "react";
import { useComboBox, useOverlayPosition } from "react-aria";
import { Item, useAsyncList, useComboBoxState } from "react-stately";
import { Popover } from "src/components/internal";
import { ListBox } from "src/inputs/internal/ListBox";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { valueToKey } from "src/inputs/Value";

interface AutocompleteProps<T> {
  onSelect: (item: T) => void;
  onSearch: (searchStr: string | undefined) => Promise<T[]>;
  getOptionMenuLabel?: (o: T) => ReactNode;
  getOptionLabel: (o: T) => string;
  getOptionValue: (o: T) => string;
  label: string;
}

export function Autocomplete<T extends object>(props: AutocompleteProps<T>) {
  const { onSearch, onSelect, getOptionLabel, getOptionValue, getOptionMenuLabel, label } = props;
  const list = useAsyncList<T>({
    async load({ filterText }) {
      const items = filterText ? await onSearch(filterText) : [];
      return { items };
    },
  });

  const comboBoxProps = {
    allowsEmptyCollection: true,
    onInputChange: list.setFilterText,
    children: (item: T) => (
      <Item key={getOptionValue(item)} textValue={getOptionValue(item)}>
        {getOptionMenuLabel ? getOptionMenuLabel(item) : getOptionLabel(item)}
      </Item>
    ),
    onSelectionChange: (key: Key) => {
      const selectedItem = list.items.find((i) => getOptionValue(i) === key);
      if (selectedItem) {
        list.setFilterText(getOptionLabel(selectedItem));
        onSelect(selectedItem);
      }
    },
    inputValue: list.filterText,
    items: list.items,
    label,
  };

  const state = useComboBoxState<T>(comboBoxProps);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef(null);
  const listBoxRef = useRef(null);
  const popoverRef = useRef(null);
  const { inputProps, listBoxProps, labelProps } = useComboBox(
    { ...comboBoxProps, inputRef, listBoxRef, popoverRef },
    state,
  );

  // useOverlayPosition moves the overlay to the top of the DOM to avoid any z-index issues. Uses the `targetRef` to DOM placement
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: inputWrapRef,
    overlayRef: popoverRef,
    scrollRef: listBoxRef,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: "bottom left",
  });

  positionProps.style = {
    ...positionProps.style,
    width: inputWrapRef?.current?.clientWidth,
    // Ensures the menu never gets too small.
    minWidth: 200,
  };

  return (
    <div>
      <TextFieldBase
        inputRef={inputRef}
        inputWrapRef={inputWrapRef}
        inputProps={inputProps}
        labelProps={labelProps}
        label={label}
        onChange={(v) => list.setFilterText(v ?? "")}
        clearable
      />
      {state.isOpen && list.items.length > 0 && (
        <Popover
          triggerRef={inputRef}
          popoverRef={popoverRef}
          positionProps={positionProps}
          onClose={() => state.close()}
          isOpen={state.isOpen}
          minWidth={200}
        >
          <ListBox
            {...listBoxProps}
            positionProps={positionProps}
            state={state}
            listBoxRef={listBoxRef}
            getOptionValue={(o) => valueToKey(getOptionValue(o))}
            getOptionLabel={getOptionLabel}
            loading={list.isLoading}
          />
        </Popover>
      )}
    </div>
  );
}
