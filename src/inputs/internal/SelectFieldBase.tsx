import { Selection } from "@react-types/shared";
import React, { Key, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useButton, useComboBox, useFilter, useOverlayPosition } from "react-aria";
import { Item, useComboBoxState, useMultipleSelectionState } from "react-stately";
import { resolveTooltip } from "src/components";
import { Popover } from "src/components/internal";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css, px } from "src/Css";
import { ListBox } from "src/inputs/internal/ListBox";
import { SelectFieldInput } from "src/inputs/internal/SelectFieldInput";
import { keyToValue, Value, valueToKey } from "src/inputs/Value";
import { BeamFocusableProps } from "src/interfaces";
import { areArraysEqual } from "src/utils";

export interface BeamSelectFieldBaseProps<O, V extends Value> extends BeamFocusableProps, PresentationFieldProps {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. `isUnsetOpt` is only defined for single SelectField */
  getOptionMenuLabel?: (opt: O, isUnsetOpt?: boolean) => string | ReactNode;
  getOptionValue?: (opt: O) => V;
  getOptionLabel?: (opt: O) => string;
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  values: V[] | undefined;
  onSelect: (values: V[], opts: O[]) => void;
  multiselect?: boolean;
  disabledOptions?: (V | { value: V; reason: string })[];
  options: OptionsOrLoad<O>;
  /** Whether the field is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  required?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  /** Allow placing an icon/decoration within the input field. */
  fieldDecoration?: (opt: O) => ReactNode;
  /** Sets the form field label. */
  label: string;
  // Whether the field is readOnly. If a ReactNode, it's treated as a "readOnly reason" that's shown in a tooltip.
  readOnly?: boolean | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  sizeToContent?: boolean;
  /** The text to show when nothing is selected, i.e. could be "All" for filters. */
  nothingSelectedText?: string;
  /** When set the SelectField is expected to be put on a darker background */
  contrast?: boolean;
  /** Placeholder content */
  placeholder?: string;
  /** Only used for Single Select Fields. If set, prepends an option with a `undefined` value at the top of the list */
  unsetLabel?: string;
  hideErrorMessage?: boolean;
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
export function SelectFieldBase<O, V extends Value>(props: BeamSelectFieldBaseProps<O, V>): JSX.Element {
  const { fieldProps } = usePresentationContext();
  const {
    disabled,
    readOnly,
    onSelect,
    options,
    multiselect = false,
    values = [],
    nothingSelectedText = "",
    contrast,
    disabledOptions,
    borderless,
    unsetLabel,
    ...otherProps
  } = props;
  const labelStyle = otherProps.labelStyle ?? fieldProps?.labelStyle ?? "above";

  // Call `initializeOptions` to prepend the `unset` option if the `unsetLabel` was provided.
  const maybeOptions = useMemo(() => initializeOptions(options, unsetLabel), [options, unsetLabel]);
  // Memoize the callback functions and handle the `unset` option if provided.
  const getOptionLabel = useCallback(
    (o: O) =>
      unsetLabel && o === unsetOption ? unsetLabel : (props.getOptionLabel ?? defaultGetOptionLabel)(o as any),
    [props.getOptionLabel, unsetLabel],
  );
  const getOptionValue = useCallback(
    (o: O) =>
      unsetLabel && o === unsetOption ? (undefined as V) : (props.getOptionValue ?? defaultGetOptionValue)(o as any),
    [props.getOptionValue, unsetLabel],
  );
  const getOptionMenuLabel = useCallback(
    (o: O) =>
      props.getOptionMenuLabel
        ? props.getOptionMenuLabel(o, Boolean(unsetLabel) && o === unsetOption)
        : getOptionLabel(o),
    [props.getOptionValue, unsetLabel, getOptionLabel],
  );

  const { contains } = useFilter({ sensitivity: "base" });
  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;

  const [fieldState, setFieldState] = useState<FieldState<O>>(() => {
    const initOptions = Array.isArray(maybeOptions) ? maybeOptions : maybeOptions.initial;
    const selectedOptions = initOptions.filter((o) => values.includes(getOptionValue(o)));
    return {
      selectedKeys: selectedOptions?.map((o) => valueToKey(getOptionValue(o))) ?? [],
      inputValue: getInputValue(
        initOptions.filter((o) => values?.includes(getOptionValue(o))),
        getOptionLabel,
        multiselect,
        nothingSelectedText,
      ),
      filteredOptions: initOptions,
      allOptions: initOptions,
      selectedOptions: selectedOptions,
      optionsLoading: false,
    };
  });

  /** Resets field's input value and filtered options list for cases where the user exits the field without making changes (on Escape, or onBlur) */
  function resetField() {
    const inputValue = getInputValue(
      fieldState.allOptions.filter((o) => values?.includes(getOptionValue(o))),
      getOptionLabel,
      multiselect,
      nothingSelectedText,
    );
    // Conditionally reset the value if the current inputValue doesn't match that of the passed in value, or we filtered the list
    if (inputValue !== fieldState.inputValue || fieldState.filteredOptions.length !== fieldState.allOptions.length) {
      setFieldState((prevState) => ({
        ...prevState,
        inputValue,
        filteredOptions: prevState.allOptions,
      }));
    }
  }

  function onSelectionChange(keys: Selection): void {
    // We don't currently handle the "all" case
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
      setFieldState({
        ...fieldState,
        inputValue: state.isOpen ? "" : nothingSelectedText,
        selectedKeys: [],
        selectedOptions: [],
      });
      selectionChanged && onSelect([], []);
      return;
    }

    const selectedKeys = [...keys.values()];
    const selectedOptions = fieldState.allOptions.filter((o) => selectedKeys.includes(valueToKey(getOptionValue(o))));
    const firstSelectedOption = selectedOptions[0];

    setFieldState((prevState) => ({
      ...prevState,
      // If menu is open then reset inputValue to "". Otherwise set inputValue depending on number of options selected.
      inputValue:
        multiselect && (state.isOpen || selectedKeys.length > 1)
          ? ""
          : firstSelectedOption
          ? getOptionLabel(firstSelectedOption!)
          : "",
      selectedKeys,
      selectedOptions,
      filteredOptions: fieldState.allOptions,
    }));

    selectionChanged && onSelect(selectedKeys.map(keyToValue) as V[], selectedOptions);

    if (!multiselect) {
      // Close menu upon selection change only for Single selection mode
      state.close();
    }
  }

  function onInputChange(value: string) {
    if (value !== fieldState.inputValue) {
      setFieldState((prevState) => ({
        ...prevState,
        inputValue: value,
        filteredOptions: fieldState.allOptions.filter((o) => contains(getOptionLabel(o), value)),
      }));
    }
  }

  async function maybeInitLoad() {
    if (!Array.isArray(maybeOptions)) {
      setFieldState((prevState) => ({ ...prevState, optionsLoading: true }));
      const loadedOptions = (await maybeOptions.load()).options;
      // Ensure the `unset` option is prepended to the top of the list if `unsetLabel` was provided
      const options = !unsetLabel ? loadedOptions : getOptionsWithUnset(unsetLabel, loadedOptions);
      setFieldState((prevState) => ({
        ...prevState,
        filteredOptions: options,
        allOptions: options,
        optionsLoading: false,
      }));
    }
  }

  const firstOpen = useRef(true);
  function onOpenChange(isOpen: boolean) {
    if (firstOpen.current && isOpen) {
      maybeInitLoad();
      firstOpen.current = false;
    }
    setFieldState((prevState) => ({
      ...prevState,
      // When using the multiselect field, always empty the input upon open.
      inputValue: multiselect && isOpen ? "" : prevState.inputValue,
    }));
  }

  // Used to calculate the rendered width of the combo box (input + button)
  const comboBoxRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const listBoxRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // `disabledKeys` from ComboBoxState does not support additional meta for showing a disabled reason to the user
  // This lookup map helps us cleanly prune out the optional reason text, then access it further down the component tree
  const disabledOptionsWithReasons = Object.fromEntries(disabledOptions?.map(disabledOptionToKeyedTuple) ?? []);

  const comboBoxProps = {
    ...otherProps,
    disabledKeys: Object.keys(disabledOptionsWithReasons),
    inputValue: fieldState.inputValue,
    items: fieldState.filteredOptions,
    isDisabled,
    isReadOnly,
    onInputChange,
    onOpenChange,
    children: (item: any) => (
      <Item key={valueToKey(getOptionValue(item))} textValue={getOptionLabel(item)}>
        {getOptionMenuLabel(item)}
      </Item>
    ),
  };

  const state = useComboBoxState<any>({
    ...comboBoxProps,
    allowsEmptyCollection: true,
    // useComboBoxState.onSelectionChange will be executed if a keyboard interaction (Enter key) is used to select an item
    onSelectionChange: (key) => {
      // ignore undefined/null keys - `null` can happen if input field's value is completely deleted after having a value assigned.
      if (key) {
        const selectedKeys = state.selectionManager.selectedKeys;
        // Create the `newSelection` Set depending on the value type of SelectField.
        const newSelection: Set<Key> = new Set(!multiselect ? [key] : [...selectedKeys, key]);
        // Use only the `multipleSelectionState` to manage selected keys
        state.selectionManager.setSelectedKeys(newSelection);
      }
    },
  });

  // @ts-ignore - `selectionManager.state` exists, but not according to the types
  state.selectionManager.state = useMultipleSelectionState({
    selectionMode: multiselect ? "multiple" : "single",
    // Do not allow an empty selection if single select mode
    disallowEmptySelection: !multiselect,
    selectedKeys: fieldState.selectedKeys,
    onSelectionChange,
  });

  // Ensure we reset if the field's values change and the user is not actively selecting options.
  useEffect(() => {
    if (!state.isOpen && !areArraysEqual(values, fieldState.selectedKeys)) {
      setFieldState((prevState) => {
        const selectedOptions = prevState.allOptions.filter((o) => values?.includes(getOptionValue(o)));

        return {
          ...prevState,
          selectedKeys: selectedOptions?.map((o) => valueToKey(getOptionValue(o))) ?? [],
          inputValue:
            selectedOptions.length === 1
              ? getOptionLabel(selectedOptions[0])
              : multiselect && selectedOptions.length === 0
              ? nothingSelectedText
              : "",
          selectedOptions: selectedOptions,
        };
      });
    }
  }, [values]);

  useEffect(() => {
    // Only update the fieldset when options change, when options is an array.
    // Otherwise, if the options are passed in as an object, then we assume the caller is updating options via a Promise and not via updating props.
    if (Array.isArray(maybeOptions) && maybeOptions !== fieldState.allOptions) {
      setFieldState((prevState) => {
        const selectedOptions = maybeOptions.filter((o) => values?.includes(getOptionValue(o)));
        return {
          ...prevState,
          selectedKeys: selectedOptions?.map((o) => valueToKey(getOptionValue(o))) ?? [],
          inputValue:
            selectedOptions.length === 1
              ? getOptionLabel(selectedOptions[0])
              : multiselect && selectedOptions.length === 0
              ? nothingSelectedText
              : "",
          selectedOptions: selectedOptions,
          filteredOptions: maybeOptions,
          allOptions: maybeOptions,
        };
      });
    }
  }, [maybeOptions]);

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
    placement: "bottom left",
    offset: borderless ? 8 : 4,
  });

  positionProps.style = {
    ...positionProps.style,
    width: comboBoxRef?.current?.clientWidth,
    // Ensures the menu never gets too small.
    minWidth: 200,
  };

  return (
    <div css={Css.df.fdc.w100.maxw(px(550)).if(labelStyle === "left").maxw100.$} ref={comboBoxRef}>
      <SelectFieldInput
        {...otherProps}
        buttonProps={buttonProps}
        buttonRef={triggerRef}
        inputProps={inputProps}
        inputRef={inputRef}
        inputWrapRef={inputWrapRef}
        state={state}
        labelProps={labelProps}
        selectedOptions={fieldState.selectedOptions}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        contrast={contrast}
        nothingSelectedText={nothingSelectedText}
        borderless={borderless}
        tooltip={resolveTooltip(disabled, undefined, readOnly)}
        resetField={resetField}
      />
      {state.isOpen && (
        <Popover
          triggerRef={triggerRef}
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
            selectedOptions={fieldState.selectedOptions}
            getOptionLabel={getOptionLabel}
            getOptionValue={(o) => valueToKey(getOptionValue(o))}
            contrast={contrast}
            horizontalLayout={labelStyle === "left"}
            loading={fieldState.optionsLoading}
            disabledOptionsWithReasons={disabledOptionsWithReasons}
          />
        </Popover>
      )}
    </div>
  );
}

type FieldState<O> = {
  selectedKeys: Key[];
  inputValue: string;
  filteredOptions: O[];
  selectedOptions: O[];
  allOptions: O[];
  optionsLoading: boolean;
};
type OptionsOrLoad<O> = O[] | { initial: O[]; load: () => Promise<{ options: O[] }> };
type UnsetOption = { id: undefined; name: string };

function getInputValue<O>(
  selectedOptions: O[],
  getOptionLabel: (o: O) => string,
  multiselect: boolean,
  nothingSelectedText: string,
) {
  return selectedOptions.length === 1
    ? getOptionLabel(selectedOptions[0])
    : multiselect && selectedOptions.length === 0
    ? nothingSelectedText
    : "";
}

export function initializeOptions<O>(options: OptionsOrLoad<O>, unsetLabel: string | undefined): OptionsOrLoad<O> {
  if (!unsetLabel) {
    return options;
  }

  if (Array.isArray(options)) {
    return getOptionsWithUnset(unsetLabel, options);
  }

  return { ...options, initial: getOptionsWithUnset(unsetLabel, options.initial) };
}

function getOptionsWithUnset<O>(unsetLabel: string, options: O[]): O[] {
  return [unsetOption as unknown as O, ...options];
}

export const unsetOption = {};

export function disabledOptionToKeyedTuple(
  disabledOption: Value | { value: Value; reason: string },
): [React.Key, string | undefined] {
  if (typeof disabledOption === "object" && disabledOption !== null) {
    return [valueToKey(disabledOption.value), disabledOption.reason];
  } else {
    return [valueToKey(disabledOption), undefined];
  }
}

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

type InferrableOptionValue = AtLeastOne<{
  id: any;
  value: any;
}>;
export const defaultGetOptionValue = (o: InferrableOptionValue) =>
  o?.id ??
  o?.value ??
  (() => {
    throw new Error("Unable to determine option value. Please provide a custom getOptionValue function");
  })();

type InferrableOptionLabel = AtLeastOne<{
  displayName: any;
  name: any;
  label: any;
  value: any;
}>;
export const defaultGetOptionLabel = (o: InferrableOptionLabel): string =>
  o?.displayName ||
  o?.name ||
  o?.label ||
  o?.value ||
  (() => {
    throw new Error("Unable to determine option label. Please provide a custom getOptionValue function");
  })();
