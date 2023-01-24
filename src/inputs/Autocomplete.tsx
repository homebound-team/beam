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
  /** A function that returns how to render the an option in the menu. If not set, `getOptionLabel` will be used */
  getOptionMenuLabel?: (o: T) => ReactNode;
  /** A function that returns the string value of the option. Used for accessibility purposes */
  getOptionLabel: (o: T) => string;
  /** A function that returns a unique key for an option */
  getOptionValue: (o: T) => string;
  /** Called when the input value changes */
  onInputChange: (value: string | undefined) => void;
  /** The current value of the input */
  value: string | undefined;
  /** The list of options to choose from */
  options: T[];
  /** The placeholder text to show when the input is empty */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
}

export function Autocomplete<T extends object>(props: AutocompleteProps<T>) {
  const {
    onSelect,
    getOptionLabel,
    getOptionValue,
    getOptionMenuLabel,
    onInputChange,
    value,
    options,
    disabled,
    ...others
  } = props;

  const comboBoxProps = {
    isDisabled: !!disabled,
    onInputChange: onInputChange,
    inputValue: value,
    items: options,
    // Allow the user to type in a value that is not in the list. Allows for the text to stay in the input when the user clicks away
    allowsCustomValue: true,
    children: (item: T) => (
      <Item key={getOptionValue(item)} textValue={getOptionValue(item)}>
        {getOptionMenuLabel ? getOptionMenuLabel(item) : getOptionLabel(item)}
      </Item>
    ),
    onSelectionChange: (key: Key) => {
      const selectedItem = options.find((i) => getOptionValue(i) === key);
      if (selectedItem) {
        onInputChange(getOptionLabel(selectedItem));
        onSelect(selectedItem);
      }
    },
    ...others,
  };

  const state = useComboBoxState<T>(comboBoxProps);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef(null);
  const listBoxRef = useRef(null);
  const popoverRef = useRef(null);
  const { inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...comboBoxProps,
      inputRef,
      listBoxRef,
      popoverRef,
      // When the input is focused and there are options, open the menu
      onFocus: () => options.length > 0 && state.open(),
    },
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
    <>
      <TextFieldBase
        inputRef={inputRef}
        inputWrapRef={inputWrapRef}
        inputProps={inputProps}
        labelProps={labelProps}
        onChange={onInputChange}
        clearable
        // Respect if caller to passes in `startAdornment={undefined}`
        startAdornment={"startAdornment" in props ? props.startAdornment : <Icon icon="search" />}
        {...others}
      />
      {state.isOpen && (
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
    </>
  );
}
