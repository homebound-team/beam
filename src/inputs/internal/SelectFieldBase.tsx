import { useComboBox } from "@react-aria/combobox";
import { useFilter } from "@react-aria/i18n";
import { Item } from "@react-stately/collections";
import { useComboBoxState } from "@react-stately/combobox";
import { CollectionChildren, Selection } from "@react-types/shared";
import React, { Key, ReactNode, useEffect, useRef, useState } from "react";
import { useButton, useFocusRing, useOverlayPosition } from "react-aria";
import { useMultipleSelectionState } from "react-stately";
import { ListBox, Popover } from "src/components/internal";
import { Css, px } from "src/Css";
import { SelectFieldInput } from "src/inputs/internal/SelectFieldInput";
import { BeamFocusableProps } from "src/interfaces";

export interface SelectFieldBaseProps<O, V extends Key> extends BeamSelectFieldBaseProps<O> {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. */
  getOptionMenuLabel?: (opt: O) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  values: V[] | undefined;
  onSelect: (keys: V[]) => void;
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
export function SelectFieldBase<O, V extends Key>(props: SelectFieldBaseProps<O, V>): JSX.Element {
  const {
    getOptionValue,
    getOptionLabel,
    getOptionMenuLabel = getOptionLabel,
    onSelect,
    options,
    values,
    multiselect = false,
    ...beamSelectFieldBaseProps
  } = props;

  const { contains } = useFilter({ sensitivity: "base" });

  // Use the current value to find the option
  const selectedKeys: V[] = values ?? [];
  // @ts-ignore, we need to coerce this to be a string,...
  const selectedOptions = options.filter((o) => selectedKeys.includes(String(getOptionValue(o))));

  const initFieldState = {
    isOpen: false,
    selectedKeys: selectedKeys,
    inputValue:
      selectedOptions.length === 1
        ? getOptionLabel(selectedOptions[0])
        : multiselect && selectedOptions.length === 0
        ? "All"
        : "",
    filteredOptions: options,
    selectedOptions: selectedOptions,
  };

  const [fieldState, setFieldState] = useState<{
    isOpen: boolean;
    selectedKeys: V[];
    inputValue: string;
    filteredOptions: O[];
    selectedOptions: O[];
  }>(initFieldState);

  // Ensure we reset if the field's values change
  useEffect(() => setFieldState(initFieldState), [values]);

  return (
    <ComboBox<O, V>
      {...beamSelectFieldBaseProps}
      multiselect={multiselect}
      filteredOptions={fieldState.filteredOptions}
      inputValue={fieldState.inputValue}
      selectedKeys={fieldState.selectedKeys}
      selectedOptions={fieldState.selectedOptions}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      onSelectionChange={(keys) => {
        const fieldState = { filteredOptions: options };

        if (keys === "all") {
          return;
        }

        if (multiselect && keys.size === 0) {
          // "All" happens if we selected everything or nothing.
          setFieldState({
            ...fieldState,
            isOpen: true,
            inputValue: "All",
            selectedKeys: [],
            selectedOptions: [],
          });
          onSelect && onSelect([]);
          return;
        }

        const keysArray = [...keys.values()];
        const firstKey = keysArray[0];
        // Even though the key is number|string, this will always be a string
        const firstSelectedOption = options.find((o) => String(getOptionValue(o)) === firstKey);

        if (multiselect) {
          setFieldState({
            ...fieldState,
            isOpen: true,
            inputValue: keysArray.length === 1 ? getOptionLabel(firstSelectedOption!) : "",
            selectedKeys: keysArray as V[],
            selectedOptions: options.filter((o) => keysArray.includes(String(getOptionValue(o)))),
          });
        } else {
          setFieldState({
            ...fieldState,
            isOpen: false,
            inputValue: firstSelectedOption ? getOptionLabel(firstSelectedOption) : "",
            selectedKeys: [firstKey] as V[],
            selectedOptions: firstSelectedOption ? [firstSelectedOption] : [],
          });
        }

        onSelect && onSelect([...keys.values()] as V[]);
      }}
      onInputChange={(value) => {
        setFieldState((prevState) => ({
          ...prevState,
          isOpen: true,
          inputValue: value,
          filteredOptions: options.filter((o) => contains(getOptionLabel(o), value)),
        }));
      }}
      onOpenChange={(isOpen) => {
        setFieldState((prevState) => ({
          ...prevState,
          isOpen,
        }));
      }}
    >
      {(item) => (
        <Item key={getOptionValue(item)} textValue={getOptionLabel(item)}>
          {getOptionMenuLabel(item)}
        </Item>
      )}
    </ComboBox>
  );
}

interface ComboBoxProps<O, V extends Key> extends BeamSelectFieldBaseProps<O> {
  children: CollectionChildren<O>;
  filteredOptions?: O[];
  inputValue?: string | undefined;
  selectedKeys?: Key[];
  onSelectionChange: (keys: Selection) => any;
  onOpenChange: (isOpen: boolean) => void;
  onInputChange: (value: string) => void;
  selectedOptions: O[];
  multiselect: boolean;
  getOptionLabel: (opt: O) => string;
  getOptionValue: (opt: O) => V;
}

/** Ties together SelectFieldInput (text field) and the ListBox (drop down). */
function ComboBox<O, V extends Key>(props: ComboBoxProps<O, V>) {
  const {
    compact = false,
    disabled: isDisabled = false,
    errorMsg,
    helperText,
    label,
    onInputChange,
    onSelectionChange,
    readOnly: isReadOnly = false,
    fieldDecoration,
    filteredOptions: items,
    onBlur,
    onFocus,
    inlineLabel,
    selectedKeys,
    selectedOptions,
    multiselect,
    getOptionLabel,
    getOptionValue,
    sizeToContent = false,
    ...otherProps
  } = props;

  type MenuTriggerAction = "focus" | "input" | "manual";
  const menuTrigger: MenuTriggerAction = "focus";

  const comboBoxProps = { ...otherProps, items, isDisabled, isReadOnly, label, onInputChange, menuTrigger };
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
    selectedKeys,
    onSelectionChange: (keys) => {
      // Close menu upon selection change only for Single selection mode
      if (!multiselect) {
        state.close();
      }
      onSelectionChange(keys);
    },
  });

  //@ts-ignore - `selectionManager.state` exists, but not according to the types
  state.selectionManager.state = multipleSelectionState;

  // Used to calculate the rendered width of the combo box (input + button)
  const comboBoxRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const listBoxRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // For the most part, the returned props contain `aria-*` and `id` attributes for accessibility purposes.
  const { buttonProps: triggerProps, inputProps, listBoxProps, labelProps } = useComboBox(
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
  const { isFocused, focusProps } = useFocusRing({ ...props, within: true });

  // useOverlayPosition moves the overlay to the top of the DOM to avoid any z-index issues. Uses the `targetRef` to DOM placement
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: inputWrapRef,
    overlayRef: popoverRef,
    scrollRef: listBoxRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
  });

  positionProps.style = {
    ...positionProps.style,
    width: comboBoxRef?.current?.clientWidth,
  };

  return (
    <div css={Css.dif.flexColumn.w100.maxw(px(550)).$} ref={comboBoxRef} {...focusProps}>
      <SelectFieldInput
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
        isFocused={isFocused}
        isReadOnly={isReadOnly}
        state={state}
        onBlur={onBlur}
        onFocus={onFocus}
        inlineLabel={inlineLabel}
        label={label}
        labelProps={labelProps}
        selectedOptions={selectedOptions}
        getOptionValue={getOptionValue}
        sizeToContent={sizeToContent}
      />
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          positionProps={positionProps}
          onClose={() => state.close()}
          isOpen={state.isOpen}
        >
          <ListBox
            {...listBoxProps}
            state={state}
            compact={compact}
            listBoxRef={listBoxRef}
            selectedOptions={selectedOptions}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
          />
        </Popover>
      )}
    </div>
  );
}

export interface BeamSelectFieldBaseProps<T> extends BeamFocusableProps {
  compact?: boolean;
  disabled?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  /** Allow placing an icon/decoration within the input field. */
  fieldDecoration?: (opt: T) => ReactNode;
  /** Sets the form field label. */
  label?: string;
  inlineLabel?: boolean;
  readOnly?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  sizeToContent?: boolean;
}
