import { Key, ReactNode, useRef } from "react";
import { useComboBox, useOverlayPosition } from "react-aria";
import { Item, useComboBoxState } from "react-stately";
import { Icon } from "src/components";
import { Popover } from "src/components/internal";
import { PresentationFieldProps } from "src/components/PresentationContext";
import { ListBox } from "src/inputs/internal/ListBox";
import { TextFieldBase, TextFieldBaseProps } from "src/inputs/TextFieldBase";
import { valueToKey } from "src/inputs/Value";

interface AutocompleteProps<T>
  extends Pick<PresentationFieldProps, "labelStyle">,
    Pick<TextFieldBaseProps<any>, "label" | "clearable" | "startAdornment"> {
  onSelect: (item: T) => void;
  getOptionMenuLabel?: (o: T) => ReactNode;
  getOptionLabel: (o: T) => string;
  getOptionValue: (o: T) => string;
  onChange: (value: string) => void;
  value: string;
  options: T[];
  placeholder?: string;
  disabled?: boolean;
}

export function AlgoliaAutocomplete<T extends object>(props: AutocompleteProps<T>) {
  const { onSelect, getOptionLabel, getOptionValue, getOptionMenuLabel, onChange, value, options, ...others } = props;

  const comboBoxProps = {
    allowsEmptyCollection: true,
    onInputChange: onChange,
    children: (item: T) => (
      <Item key={getOptionValue(item)} textValue={getOptionValue(item)}>
        {getOptionMenuLabel ? getOptionMenuLabel(item) : getOptionLabel(item)}
      </Item>
    ),
    onSelectionChange: (key: Key) => {
      const selectedItem = options.find((i) => getOptionValue(i) === key);
      if (selectedItem) {
        onChange(getOptionLabel(selectedItem));
        onSelect(selectedItem);
      }
    },
    inputValue: value,
    items: options,
    ...others,
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
        onChange={(v) => onChange(v ?? "")}
        clearable
        startAdornment={<Icon icon="search" />}
        {...others}
      />
      {state.isOpen && options.length > 0 && (
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
          />
        </Popover>
      )}
    </div>
  );
}
