import { Selection } from "@react-types/shared";
import { Key, ReactNode, useEffect, useRef, useState } from "react";
import { useButton, useComboBox, useFilter, useOverlayPosition } from "react-aria";
import { Item, useComboBoxState, useMultipleSelectionState } from "react-stately";
import { Popover } from "src/components/internal";
import { Css, px } from "src/Css";
import { ListBox } from "src/inputs/internal/ListBox";
import { SelectFieldInput } from "src/inputs/internal/SelectFieldInput";
import { keyToValue, Value, valueToKey } from "src/inputs/Value";
import { BeamFocusableProps } from "src/interfaces";

type FieldState<O> = {
  isOpen: boolean;
  selectedKeys: Key[];
  inputValue: string;
  filteredOptions: O[];
  selectedOptions: O[];
};

export interface SelectFieldBaseProps<O, V extends Value> extends BeamSelectFieldBaseProps<O, V> {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. */
  getOptionMenuLabel?: (opt: O) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  values: V[] | undefined;
  onSelect: (values: V[]) => void;
  options: O[];
  multiselect?: boolean;
}

/**
 * Provides a non-native select/dropdown widget.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 *
 * Note that the `V extends Key` constraint come from react-aria,
 * and so we cannot easily change them.
 */
export function SelectFieldBase<O, V extends Value>(props: SelectFieldBaseProps<O, V>): JSX.Element {
  const {
    compact = false,
    disabled: isDisabled = false,
    errorMsg,
    helperText,
    label,
    hideLabel,
    required,
    inlineLabel,
    readOnly: isReadOnly = false,
    onSelect,
    fieldDecoration,
    options,
    onBlur,
    onFocus,
    multiselect = false,
    getOptionLabel,
    getOptionValue,
    getOptionMenuLabel = getOptionLabel,
    sizeToContent = false,
    values,
    nothingSelectedText = "",
    contrast,
    disabledOptions,
    ...otherProps
  } = props;

  const { contains } = useFilter({ sensitivity: "base" });

  function onSelectionChange(keys: Selection): void {
    // Close menu upon selection change only for Single selection mode
    if (!multiselect) {
      state.close();
    }
    if (keys === "all") {
      return;
    }

    // `onSelectionChange` may be called even if the selection's didn't change.
    // For example, we trigger this `onBlur` of SelectFieldInput in order to reset the input's value.
    // In those cases, we do not need to again call `onSelect` so let's avoid it if we can.
    const selectionChanged = !(
      keys.size === state.selectionManager.selectedKeys.size &&
      [...keys].every((value) => state.selectionManager.selectedKeys.has(value))
    );

    if (multiselect && keys.size === 0) {
      // "All" happens if we selected everything or nothing.
      setFieldState({
        ...fieldState,
        isOpen: true,
        inputValue: state.isOpen ? "" : nothingSelectedText,
        selectedKeys: [],
        selectedOptions: [],
      });
      selectionChanged && onSelect([]);
      return;
    }
    const keysArray = [...keys.values()];
    const firstKey = keysArray[0];
    // Even though the key is number|string, this will always be a string
    const firstSelectedOption = options.find((o) => valueToKey(getOptionValue(o)) === firstKey);
    if (multiselect) {
      setFieldState({
        ...fieldState,
        // If menu is open then reset inputValue to "". Otherwise set inputValue depending on number of options selected.
        inputValue: state.isOpen ? "" : keysArray.length === 1 ? getOptionLabel(firstSelectedOption!) : "",
        selectedKeys: keysArray as Key[],
        selectedOptions: options.filter((o) => keysArray.includes(valueToKey(getOptionValue(o)))),
        filteredOptions: options,
      });
    } else {
      setFieldState({
        ...fieldState,
        isOpen: false,
        inputValue: firstSelectedOption ? getOptionLabel(firstSelectedOption) : "",
        selectedKeys: [firstKey] as Key[],
        selectedOptions: firstSelectedOption ? [firstSelectedOption] : [],
      });
    }
    selectionChanged && onSelect(([...keys.values()] as Key[]).map(keyToValue) as V[]);
  }

  function onInputChange(value: string) {
    setFieldState((prevState) => ({
      ...prevState,
      isOpen: true,
      inputValue: value,
      filteredOptions: options.filter((o) => contains(getOptionLabel(o), value)),
    }));
  }

  function onOpenChange(isOpen: boolean) {
    setFieldState((prevState) => ({
      ...prevState,
      inputValue: multiselect && isOpen ? "" : prevState.inputValue,
      isOpen,
    }));
  }

  function initFieldState(): FieldState<O> {
    // Use the current value to find the option
    const selectedKeys: V[] = values ?? [];
    const selectedOptions = options.filter((o) => selectedKeys.includes(getOptionValue(o)));
    return {
      isOpen: false,
      selectedKeys: selectedKeys.map(valueToKey),
      inputValue:
        selectedOptions.length === 1
          ? getOptionLabel(selectedOptions[0])
          : multiselect && selectedOptions.length === 0
          ? nothingSelectedText
          : "",
      filteredOptions: options,
      selectedOptions: selectedOptions,
    };
  }

  const [fieldState, setFieldState] = useState<FieldState<O>>(initFieldState);

  const comboBoxProps = {
    ...otherProps,
    disabledKeys: disabledOptions?.map(valueToKey),
    inputValue: fieldState.inputValue,
    items: fieldState.filteredOptions,
    isDisabled,
    isReadOnly,
    label,
    onInputChange,
    onOpenChange,
    menuTrigger: "focus" as const,
    children: (item: any) => (
      <Item key={valueToKey(getOptionValue(item))} textValue={getOptionLabel(item)}>
        {getOptionMenuLabel(item)}
      </Item>
    ),
  };

  const state = useComboBoxState<any>({
    ...comboBoxProps,
    // useComboBoxState.onSelectionChange will be executed if a keyboard interaction (Enter key) is used to select an item
    onSelectionChange: (key) => {
      // ignore undefined/null keys - `null` can happen if input field's value is completely deleted after having a value assigned.
      if (key) {
        const selectedKeys = multipleSelectionState.selectedKeys;
        // Create the `newSelection` Set depending on the value type of SelectField.
        const newSelection: Set<Key> = new Set(!multiselect ? [key] : [...selectedKeys, key]);
        // Use only the `multipleSelectionState` to manage selected keys
        multipleSelectionState.setSelectedKeys(newSelection);
      }
    },
  });

  const multipleSelectionState = useMultipleSelectionState({
    selectionMode: multiselect ? "multiple" : "single",
    // Do not allow an empty selection if single select mode
    disallowEmptySelection: !multiselect,
    selectedKeys: fieldState.selectedKeys,
    onSelectionChange,
  });

  //@ts-ignore - `selectionManager.state` exists, but not according to the types
  state.selectionManager.state = multipleSelectionState;

  // Ensure we reset if the field's values change and the user is not actively selecting options.
  useEffect(() => {
    if (!state.isOpen) {
      setFieldState(initFieldState);
    }
  }, [values]);

  // Used to calculate the rendered width of the combo box (input + button)
  const comboBoxRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const listBoxRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // For the most part, the returned props contain `aria-*` and `id` attributes for accessibility purposes.
  const {
    buttonProps: triggerProps,
    inputProps,
    listBoxProps,
    labelProps,
  } = useComboBox(
    {
      ...comboBoxProps,
      inputRef,
      buttonRef: triggerRef,
      listBoxRef,
      popoverRef,
    },
    state,
  );

  const { buttonProps } = useButton({ ...triggerProps, isDisabled: isDisabled || isReadOnly }, triggerRef);

  // useOverlayPosition moves the overlay to the top of the DOM to avoid any z-index issues. Uses the `targetRef` to DOM placement
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: inputWrapRef,
    overlayRef: popoverRef,
    scrollRef: listBoxRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: "bottom",
  });

  positionProps.style = {
    ...positionProps.style,
    width: comboBoxRef?.current?.clientWidth,
  };

  return (
    <div css={Css.df.fdc.w100.maxw(px(550)).$} ref={comboBoxRef}>
      <SelectFieldInput
        {...otherProps}
        buttonProps={buttonProps}
        buttonRef={triggerRef}
        compact={compact}
        errorMsg={errorMsg}
        helperText={helperText}
        fieldDecoration={fieldDecoration}
        inputProps={inputProps}
        inputRef={inputRef}
        inputWrapRef={inputWrapRef}
        isDisabled={isDisabled}
        required={required}
        isReadOnly={isReadOnly}
        state={state}
        onBlur={onBlur}
        onFocus={onFocus}
        inlineLabel={inlineLabel}
        label={label}
        hideLabel={hideLabel}
        labelProps={labelProps}
        selectedOptions={fieldState.selectedOptions}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        sizeToContent={sizeToContent}
        contrast={contrast}
        nothingSelectedText={nothingSelectedText}
      />
      {state.isOpen && (
        <Popover
          triggerRef={triggerRef}
          popoverRef={popoverRef}
          positionProps={positionProps}
          onClose={() => state.close()}
          isOpen={state.isOpen}
        >
          <ListBox
            {...listBoxProps}
            positionProps={positionProps}
            state={state}
            compact={compact}
            listBoxRef={listBoxRef}
            selectedOptions={fieldState.selectedOptions}
            getOptionLabel={getOptionLabel}
            getOptionValue={(o) => valueToKey(getOptionValue(o))}
            contrast={contrast}
          />
        </Popover>
      )}
    </div>
  );
}

export interface BeamSelectFieldBaseProps<T, V extends Value> extends BeamFocusableProps {
  disabledOptions?: V[];
  compact?: boolean;
  disabled?: boolean;
  required?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  /** Allow placing an icon/decoration within the input field. */
  fieldDecoration?: (opt: T) => ReactNode;
  /** Sets the form field label. */
  label: string;
  hideLabel?: boolean;
  /** Renders the label inside the input field, i.e. for filters. */
  inlineLabel?: boolean;
  readOnly?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  sizeToContent?: boolean;
  /** The text to show when nothing is selected, i.e. could be "All" for filters. */
  nothingSelectedText?: string;
  /** When set the SelectField is expected to be put on a darker background */
  contrast?: boolean;
}
