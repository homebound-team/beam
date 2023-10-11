import { Selection } from "@react-types/shared";
import React, { Key, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useButton, useComboBox, useFilter, useOverlayPosition } from "react-aria";
import { Item, useComboBoxState, useMultipleSelectionState } from "react-stately";
import { resolveTooltip } from "src/components";
import { Popover } from "src/components/internal";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css, px } from "src/Css";
import { ComboBoxInput } from "src/inputs/internal/ComboBoxInput";
import { ListBox } from "src/inputs/internal/ListBox";
import { keyToValue, Value, valueToKey } from "src/inputs/Value";
import { BeamFocusableProps } from "src/interfaces";

/** Base props for either `SelectField` or `MultiSelectField`. */
export interface ComboBoxBaseProps<O, V extends Value> extends BeamFocusableProps, PresentationFieldProps {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. `isUnsetOpt` is only defined for single SelectField */
  getOptionMenuLabel?: (opt: O, isUnsetOpt?: boolean) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
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
  /**
   * The text to show when nothing is selected, i.e. could be "All" for filters.
   *
   * Unlike `unsetLabel`, this does not add an explicit option for the user to select.
   */
  nothingSelectedText?: string;
  /** When set the SelectField is expected to be put on a darker background */
  contrast?: boolean;
  /** Placeholder content */
  placeholder?: string;
  /**
   * If set, prepends an option with an `undefined` value at the top of the list to allow
   * unsetting the field.
   *
   * Unlike `nothingSelectedText`, which provides the label for empty value state, but doesn't
   * add an option for the user to explicitly select the empty state.
   *
   * Only available for Single Select Fields.
   */
  unsetLabel?: string;
  hideErrorMessage?: boolean;
  /* Allows input to wrap to multiple lines */
  multiline?: boolean;
}

/**
 * Provides a non-native select/dropdown widget that allows the user to type to filter the options.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 *
 * Note that the `V extends Key` constraint come from react-aria,
 * and so we cannot easily change them.
 */
export function ComboBoxBase<O, V extends Value>(props: ComboBoxBaseProps<O, V>): JSX.Element {
  const { fieldProps } = usePresentationContext();
  const {
    disabled,
    readOnly,
    onSelect,
    options: propOptions,
    multiselect = false,
    values: propValues,
    nothingSelectedText = "",
    contrast,
    disabledOptions,
    borderless,
    unsetLabel,
    getOptionLabel: propOptionLabel,
    getOptionValue: propOptionValue,
    getOptionMenuLabel: propOptionMenuLabel,
    ...otherProps
  } = props;
  const labelStyle = otherProps.labelStyle ?? fieldProps?.labelStyle ?? "above";

  // Memoize the callback functions and handle the `unset` option if provided.
  const getOptionLabel = useCallback(
    (o: O) => (unsetLabel && o === unsetOption ? unsetLabel : propOptionLabel(o)),
    // propOptionLabel is basically always a lambda, so don't dep on it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unsetLabel],
  );
  const getOptionValue = useCallback(
    (o: O) => (unsetLabel && o === unsetOption ? (undefined as V) : propOptionValue(o)),
    // propOptionValue is basically always a lambda, so don't dep on it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unsetLabel],
  );
  const getOptionMenuLabel = useCallback(
    (o: O) =>
      propOptionMenuLabel ? propOptionMenuLabel(o, Boolean(unsetLabel) && o === unsetOption) : getOptionLabel(o),
    // propOptionMenuLabel is basically always a lambda, so don't dep on it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unsetLabel, getOptionLabel],
  );

  // Call `initializeOptions` to prepend the `unset` option if the `unsetLabel` was provided.
  const options = useMemo(
    () => initializeOptions(propOptions, getOptionValue, unsetLabel),
    // If the caller is using { current, load, options }, memoize on only `current` and `options` values.
    // ...and don't bother on memoizing on getOptionValue b/c it's basically always a lambda
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Array.isArray(propOptions) ? [propOptions, unsetLabel] : [propOptions.current, propOptions.options, unsetLabel],
  );

  const values = useMemo(() => propValues ?? [], [propValues]);

  const selectedOptions = useMemo(() => {
    return options.filter((o) => values.includes(getOptionValue(o)));
  }, [options, values, getOptionValue]);

  const { contains } = useFilter({ sensitivity: "base" });
  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;

  // Do a one-time initialize of fieldState
  const [fieldState, setFieldState] = useState<FieldState>(() => {
    return {
      inputValue: getInputValue(selectedOptions, getOptionLabel, multiselect, nothingSelectedText),
      searchValue: undefined,
      optionsLoading: false,
    };
  });

  const { searchValue } = fieldState;
  const filteredOptions = useMemo(() => {
    return !searchValue ? options : options.filter((o) => contains(getOptionLabel(o), searchValue));
  }, [options, searchValue, getOptionLabel, contains]);

  /** Resets field's input value and filtered options list for cases where the user exits the field without making changes (on Escape, or onBlur) */
  function resetField() {
    setFieldState((prevState) => ({ ...prevState, searchValue: undefined }));
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
      selectionChanged && onSelect([], []);
      return;
    }

    const selectedKeys = [...keys.values()];
    const selectedOptions = options.filter((o) => selectedKeys.includes(valueToKey(getOptionValue(o))));
    selectionChanged && onSelect(selectedKeys.map(keyToValue) as V[], selectedOptions);

    if (!multiselect) {
      // Close menu upon selection change only for Single selection mode
      state.close();
    }
  }

  function onInputChange(value: string) {
    if (value !== fieldState.inputValue) {
      setFieldState((prevState) => ({ ...prevState, inputValue: value, searchValue: value }));
    }
  }

  async function maybeInitLoad() {
    if (!Array.isArray(propOptions)) {
      setFieldState((prevState) => ({ ...prevState, optionsLoading: true }));
      await propOptions.load();
      setFieldState((prevState) => ({ ...prevState, optionsLoading: false }));
    }
  }

  const firstOpen = useRef(true);
  function onOpenChange(isOpen: boolean) {
    if (firstOpen.current && isOpen) {
      maybeInitLoad();
      firstOpen.current = false;
    }
    // When using the multiselect field, always empty the input upon open.
    if (multiselect && isOpen) {
      setFieldState((prevState) => ({ ...prevState, inputValue: "" }));
    }
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
    items: filteredOptions,
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
    // We don't really allow custom values, as we reset the input value once a user `blur`s the input field.
    // Though, setting `allowsCustomValue: true` prevents React-Aria/Stately from attempting to reset the input field's value when the menu closes.
    allowsCustomValue: true,
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

  const selectedKeys = useMemo(() => {
    return selectedOptions.map((o) => valueToKey(getOptionValue(o)));
  }, [selectedOptions, getOptionValue]);
  // @ts-ignore - `selectionManager.state` exists, but not according to the types
  state.selectionManager.state = useMultipleSelectionState({
    selectionMode: multiselect ? "multiple" : "single",
    // Do not allow an empty selection if single select mode
    disallowEmptySelection: !multiselect,
    selectedKeys,
    onSelectionChange,
  });

  // Reset inputValue when closed or selected changes
  useEffect(() => {
    if (state.isOpen && multiselect) {
      // While the multiselect is open, let the user keep typing
      setFieldState((prevState) => ({
        ...prevState,
        inputValue: "",
        searchValue: "",
      }));
    } else {
      setFieldState((prevState) => ({
        ...prevState,
        inputValue: getInputValue(selectedOptions, getOptionLabel, multiselect, nothingSelectedText),
      }));
    }
  }, [state.isOpen, selectedOptions, getOptionLabel, multiselect, nothingSelectedText]);

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
      <ComboBoxInput
        {...otherProps}
        buttonProps={buttonProps}
        buttonRef={triggerRef}
        inputProps={inputProps}
        inputRef={inputRef}
        inputWrapRef={inputWrapRef}
        listBoxRef={listBoxRef}
        state={state}
        labelProps={labelProps}
        selectedOptions={selectedOptions}
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
            selectedOptions={selectedOptions}
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

type FieldState = {
  inputValue: string;
  // We need separate `searchValue` vs. `inputValue` b/c we might be showing the
  // currently-loaded option in the input, without the user having typed a filter yet.
  searchValue: string | undefined;
  optionsLoading: boolean;
};

/** Allows lazy-loading select fields, which is useful for pages w/lots of fields the user may not actually use. */
export type OptionsOrLoad<O> =
  | O[]
  | {
      /** The initial option to show before the user interacts with the dropdown. */
      current: O | undefined;
      /** Fired when the user interacts with the dropdown, to load the real options. */
      load: () => Promise<unknown>;
      /** The full list of options, after load() has been fired. */
      options: O[] | undefined;
    };

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

/** Transforms/simplifies `optionsOrLoad` into just options, with unsetLabel maybe added. */
export function initializeOptions<O, V extends Value>(
  optionsOrLoad: OptionsOrLoad<O>,
  getOptionValue: (opt: O) => V,
  unsetLabel: string | undefined,
): O[] {
  const opts: O[] = [];
  if (unsetLabel) {
    opts.push(unsetOption as unknown as O);
  }
  if (Array.isArray(optionsOrLoad)) {
    opts.push(...optionsOrLoad);
  } else {
    const { options, current } = optionsOrLoad;
    if (options) {
      opts.push(...options);
    }
    // Even if the SelectField has lazy-loaded options, make sure the current value is really in there
    if (current) {
      const value = getOptionValue(current);
      const found = options && options.find((o) => getOptionValue(o) === value);
      if (!found) {
        opts.push(current);
      }
    }
  }
  return opts;
}

/** A marker option to automatically add an "Unset" option to the start of options. */
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
