import { Key as AriaKey } from "@react-types/shared";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useButton, useComboBox, useFilter, useOverlayPosition } from "react-aria";
import { Item, useComboBoxState } from "react-stately";
import { resolveTooltip } from "src/components";
import { Popover } from "src/components/internal";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { Value } from "src/inputs/index";
import { disabledOptionToKeyedTuple } from "src/inputs/internal/ComboBoxBase";
import { ComboBoxInput } from "src/inputs/internal/ComboBoxInput";
import { ListBox } from "src/inputs/internal/ListBox";
import {
  findOption,
  findOptions,
  flattenOptions,
  LeveledOption,
  NestedOption,
  NestedOptionsOrLoad,
  TreeFieldState,
  TreeSelectResponse,
} from "src/inputs/TreeSelectField/utils";
import { getFieldWidth } from "src/inputs/utils";
import { keyToValue, valueToKey } from "src/inputs/Value";
import { BeamFocusableProps } from "src/interfaces";
import { HasIdAndName, Optional } from "src/types";

export type TreeSelectFieldProps<O, V extends Value> = {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. `isUnsetOpt` is only defined for single SelectField */
  getOptionMenuLabel?: (opt: O, isUnsetOpt?: boolean) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  values: V[] | undefined;
  onSelect: (options: TreeSelectResponse<O, V>) => void;
  options: NestedOptionsOrLoad<O>;
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
  hideErrorMessage?: boolean;
  /** Whether to have all groups collapsed on initial load. Can also be configured individually, which overrides this behavior.
   * @default false */
  defaultCollapsed?: boolean;
  /** Allow the field's height to grow up to a predefined height (currently 72px), then scroll. */
  multiline?: boolean;
  /** Which selected options to display as chips in the input field when not focused.
   * @default root */
  chipDisplay?: "all" | "leaf" | "root";
  disabledOptions?: V[];
  groupOptions?: V[];
} & BeamFocusableProps &
  PresentationFieldProps;

export function TreeSelectField<O, V extends Value>(props: TreeSelectFieldProps<O, V>): JSX.Element;
export function TreeSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<TreeSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function TreeSelectField<O, V extends Value>(
  props: Optional<TreeSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const {
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName
    options,
    onSelect,
    values,
    defaultCollapsed = false,
    ...otherProps
  } = props;

  const [collapsedKeys, setCollapsedKeys] = useState<AriaKey[]>([]);
  const groupKeys = useMemo(() => props.groupOptions?.map((option) => valueToKey(option)) ?? [], [props.groupOptions]);

  useEffect(() => {
    setCollapsedKeys(
      !Array.isArray(options)
        ? []
        : defaultCollapsed
          ? options.map((o) => getOptionValue(o))
          : options
              .flatMap(flattenOptions)
              .filter((o) => o.defaultCollapsed)
              .map((o) => getOptionValue(o)),
    );
    // Explicitly ignoring `getOptionValue` as it typically isn't memo'd
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, defaultCollapsed]);

  const contextValue = useMemo<CollapsedChildrenState<O, V>>(
    () => ({ collapsedKeys, setCollapsedKeys, getOptionValue, groupKeys }),
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collapsedKeys, setCollapsedKeys, groupKeys],
  );

  return (
    <CollapsedContext.Provider value={contextValue}>
      <TreeSelectFieldBase
        {...otherProps}
        options={options}
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        values={values}
        onSelect={({ all, leaf, root }) => {
          onSelect({ all, leaf, root });
        }}
      />
    </CollapsedContext.Provider>
  );
}

export function useTreeSelectFieldProvider<O, V extends Value>() {
  return useContext(CollapsedContext) as CollapsedChildrenState<O, V>;
}

type CollapsedChildrenState<O, V extends Value> = {
  collapsedKeys: AriaKey[];
  setCollapsedKeys: Dispatch<SetStateAction<AriaKey[]>>;
  getOptionValue: (opt: O) => V;
  groupKeys: AriaKey[];
};
// create the context to hold the collapsed state, default should be false
export const CollapsedContext = React.createContext<CollapsedChildrenState<any, any>>({
  collapsedKeys: [],
  setCollapsedKeys: () => {},
  getOptionValue: () => ({}) as any,
  groupKeys: [],
});

function TreeSelectFieldBase<O, V extends Value>(props: TreeSelectFieldProps<O, V>) {
  const { fieldProps } = usePresentationContext();
  const {
    values,
    options,
    getOptionValue,
    getOptionLabel,
    getOptionMenuLabel = getOptionLabel,
    disabled,
    readOnly,
    labelStyle,
    borderless,
    contrast = false,
    nothingSelectedText = "",
    onSelect,
    defaultCollapsed: _defaultCollapsed = false,
    placeholder,
    fullWidth = fieldProps?.fullWidth ?? false,
    chipDisplay = "root",
    disabledOptions,
    groupOptions: _groupOptions,
    ...otherProps
  } = props;

  void _defaultCollapsed;

  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;
  const initialOptions = Array.isArray(options) ? options : options.current;
  const { contains } = useFilter({ sensitivity: "base" });

  const { collapsedKeys } = useTreeSelectFieldProvider();
  const groupKeys = useMemo(() => _groupOptions?.map((option) => valueToKey(option)) ?? [], [_groupOptions]);
  const groupKeySet = useMemo<Set<AriaKey>>(() => new Set(groupKeys), [groupKeys]);

  // `disabledKeys` from ComboBoxState does not support additional meta for showing a disabled reason to the user
  // This lookup map helps us cleanly prune out the optional reason text, then access it further down the component tree
  const disabledOptionsWithReasons = Object.fromEntries(disabledOptions?.map(disabledOptionToKeyedTuple) ?? []);
  const disabledKeys = [...new Set<AriaKey>([...Object.keys(disabledOptionsWithReasons), ...groupKeys])];

  const initTreeFieldState: () => TreeFieldState<O> = useCallback(() => {
    // Figure out which options should be considered selected.
    // This is a bit of a complex process because:
    // 1. The `values` array could contain the values of the parent options, but not the children. So those children should be considered selected.
    // 2. The `values` array could contain the values of the children, but not the parent. So the parent should be considered selected if all children are.

    // Create a list of all selected values - using a Set to immediately dedupe the list.
    const selectedKeys: Set<AriaKey> = new Set(
      values?.flatMap((v) => {
        // Find the options that matches the value. These could be parents or a children.
        const foundOptions = findOptions(initialOptions, valueToKey(v), getOptionValue);
        // Go through the `foundOptions` and get the keys of the options and its children if it has any.
        return foundOptions.flatMap(({ option }) => selectOptionAndAllChildren(option));
      }),
    );

    function selectOptionAndAllChildren(maybeParent: NestedOption<O>): AriaKey[] {
      // Check if the maybeParent has children, if so, return those as selected keys
      // Do in a recursive way so that children may have children
      const key = valueToKey(getOptionValue(maybeParent));
      return [
        ...(groupKeySet.has(key) ? [] : [key]),
        ...(maybeParent.children?.flatMap(selectOptionAndAllChildren) ?? []),
      ];
    }

    // It is possible that all the children of a parent were considered selected `values`, but the parent wasn't included in the `values` array.
    // In this case, the parent also should be considered a selected option.
    function areAllChildrenSelected(maybeParent: NestedOption<O>): boolean {
      const key = valueToKey(getOptionValue(maybeParent));
      const isSelected = selectedKeys.has(key);
      // If already selected, or the options does not have children, then return its current state.
      if (isSelected || !maybeParent.children || maybeParent.children.length === 0) return isSelected;

      // If we do have children, then check if all children are selected.
      // if all are selected, then push this parent to the selectedKeys
      const areAllSelected = maybeParent.children.every(areAllChildrenSelected);
      if (areAllSelected && !groupKeySet.has(key)) {
        selectedKeys.add(key);
      }
      return areAllSelected;
    }

    initialOptions.forEach(areAllChildrenSelected);

    // Using the `selectedKeys` Set, find the corresponding options that are selected. As it's a Set, its already deduped.
    const selectedOptions: NestedOption<O>[] = [...selectedKeys].flatMap((key) => {
      // Find the first matching option, then this list will also be already deduped.
      const maybeOption = findOption(initialOptions, key, getOptionValue);
      if (!maybeOption) return [];
      return [maybeOption.option];
    });

    // Store the selected options shown as chips so we can reuse them across the input and open listbox.
    const selectedChipState = getSelectedChipState(
      initialOptions,
      selectedOptions,
      selectedKeys,
      chipDisplay,
      getOptionLabel,
      getOptionValue,
    );

    return {
      selectedKeys: [...selectedKeys],
      searchValue: undefined,
      inputValue:
        selectedOptions.length === 1
          ? getOptionLabel([...selectedOptions][0])
          : isReadOnly && selectedOptions.length > 0
            ? selectedChipState.labels.join(", ")
            : selectedOptions.length === 0
              ? nothingSelectedText
              : "",
      selectedOptions,
      selectedChipOptions: selectedChipState.options,
      allOptions: initialOptions,
      selectedOptionsLabels: selectedChipState.labels,
      optionsLoading: false,
      allowCollapsing: true,
    };
  }, [
    initialOptions,
    values,
    chipDisplay,
    getOptionLabel,
    isReadOnly,
    nothingSelectedText,
    getOptionValue,
    groupKeySet,
  ]);

  // Initialize the TreeFieldState
  const [fieldState, setFieldState] = useState<TreeFieldState<O>>(() => initTreeFieldState());

  useEffect(() => {
    // We don't want to do this if initialOptions is not an array, because we would be lazy loading `allOptions`
    if (Array.isArray(options)) {
      setFieldState((prevState) => ({ ...prevState, allOptions: options }));
    }
  }, [options]);

  // Reset the TreeFieldState if the values array changes and doesn't match the selectedOptions
  useEffect(() => {
    // if the values does not match the values in the fieldState, then update the fieldState
    const selectedKeys = fieldState.selectedOptions.map((o) => valueToKey(getOptionValue(o)));
    if (
      // If the values were cleared
      (values === undefined && selectedKeys.length !== 0) ||
      // Or values were set, but they don't match the selected keys
      (values && (values.length !== selectedKeys.length || !values.every((v) => selectedKeys.includes(valueToKey(v)))))
    ) {
      // Then reinitialize
      setFieldState(initTreeFieldState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getOptionValue, initTreeFieldState, values]);

  const filteredOptions = useMemo(
    () =>
      getFilteredOptions(
        fieldState.allOptions,
        fieldState.searchValue,
        collapsedKeys,
        contains,
        getOptionLabel,
        getOptionValue,
      ),
    [fieldState.allOptions, fieldState.searchValue, collapsedKeys, contains, getOptionLabel, getOptionValue],
  );

  // Update the filtered options when the input value changes
  const onInputChange = useCallback((inputValue: string) => {
    setFieldState((prevState) => {
      return {
        ...prevState,
        inputValue,
        searchValue: inputValue.length === 0 ? undefined : inputValue,
        allowCollapsing: inputValue.length === 0,
      };
    });
  }, []);

  // Handle loading of the options in the case that they are loaded via a Promise.
  const maybeInitLoad = useCallback(
    async (options: NestedOptionsOrLoad<O>, setFieldState: React.Dispatch<React.SetStateAction<TreeFieldState<O>>>) => {
      if (!Array.isArray(options)) {
        setFieldState((prevState) => ({ ...prevState, optionsLoading: true }));
        const loadedOptions = (await options.load()).options;

        // Ensure the `unset` option is prepended to the top of the list if `unsetLabel` was provided
        setFieldState((prevState) => ({
          ...prevState,
          allOptions: loadedOptions,
          optionsLoading: false,
        }));
      }
    },
    [],
  );

  // Only on the first open of the listbox, we want to load the options if they haven't been loaded yet.
  const firstOpen = useRef(true);
  function onOpenChange(isOpen: boolean) {
    if (firstOpen.current && isOpen) {
      // TODO: verify this eslint ignore
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      maybeInitLoad(options, setFieldState);
      firstOpen.current = false;
    }
    if (isOpen) {
      // reset the input field to allow the user to start typing to filter
      setFieldState((prevState) => ({
        ...prevState,
        inputValue: "",
        searchValue: undefined,
        allowCollapsing: true,
      }));
    }
  }

  // Memoize the children callback to prevent infinite re-render loops with react-aria v3.33+.
  // See ComboBoxBase.tsx for detailed explanation.
  const comboBoxChildren = useCallback(
    ([item]: LeveledOption<O>) => (
      <Item key={valueToKey(getOptionValue(item))} textValue={getOptionLabel(item)}>
        {getOptionMenuLabel(item)}
      </Item>
    ),
    [getOptionValue, getOptionLabel, getOptionMenuLabel],
  );

  const comboBoxProps = {
    ...otherProps,
    disabledKeys,
    placeholder: !values || values.length === 0 ? placeholder : "",
    label: props.label,
    inputValue: fieldState.inputValue,
    items: filteredOptions,
    isDisabled,
    isReadOnly,
    onInputChange,
    onOpenChange,
    children: comboBoxChildren,
  };

  const state = useComboBoxState<any, "multiple">({
    ...comboBoxProps,
    allowsEmptyCollection: true,
    selectionMode: "multiple",
    // Prevent commitValue from calling onChange with stale displayValue on blur.
    // Menu close is handled manually in ComboBoxInput's onBlur via state.toggle().
    shouldCloseOnBlur: false,
    value: fieldState.selectedKeys,
    onChange: (newValue: AriaKey[]) => {
      const newKeys = new Set(newValue);

      // First figure out which keys changed so we can correctly determine which affiliated options may need to be updated as well.
      const existingKeys = state.selectionManager.selectedKeys;
      const addedKeys = new Set([...newKeys].filter((x) => !existingKeys.has(x)));
      const removedKeys = new Set([...existingKeys].filter((x) => !newKeys.has(x)));

      // Make sure there are changes before we do anything.
      if (addedKeys.size > 0 || removedKeys.size > 0) {
        // Quickly return out of this if all selections are removed
        if (newKeys.size === 0) {
          setFieldState((prevState) => ({
            ...prevState,
            inputValue: nothingSelectedText,
            searchValue: undefined,
            allowCollapsing: true,
            selectedKeys: [],
            selectedOptions: [],
            selectedChipOptions: [],
            selectedOptionsLabels: [],
          }));
          onSelect({
            all: { values: [], options: [] },
            leaf: { values: [], options: [] },
            root: { values: [], options: [] },
          });
          return;
        }

        // `onChange` is only ever going to be adding or removing 1 key at a time.
        // The below logic for adding/removing using a forEach loop is just to make TS happy.
        // This may look like a lot of logic, but in the execution it will only ever be adding/removing 1 key at a time, so it really isn't as bad as it looks.

        // For added keys, we need to see if any other options should be added as well.
        [...addedKeys].forEach((key) => {
          const maybeOptions = findOptions(fieldState.allOptions, key, getOptionValue);
          if (maybeOptions.length === 0) return;

          for (const { option, parents } of maybeOptions) {
            // If the newly added option has children, then consider the children to be newly added keys as well.
            if (option && option.children && option.children.length > 0) {
              const childrenKeys = option.children
                .flatMap(flattenOptions)
                .map((o) => valueToKey(getOptionValue(o)))
                .filter((childKey) => {
                  // remove children that are disabled
                  return !state.disabledKeys.has(childKey);
                });
              [...(groupKeySet.has(key) ? [] : [key]), ...childrenKeys].forEach(addedKeys.add, addedKeys);
            }

            // If this was a child that was selected, then see if every other child is also selected, and if so, consider the parent selected.
            // Walk up the parents and determine their state.
            const selectionKeys = new Set([...existingKeys, ...addedKeys]);
            for (const parent of [...parents].reverse()) {
              const parentKey = valueToKey(getOptionValue(parent));
              if (isOptionFullySelected(parent, selectionKeys, state.disabledKeys, groupKeySet, getOptionValue)) {
                if (!groupKeySet.has(parentKey)) {
                  addedKeys.add(parentKey);
                  selectionKeys.add(parentKey);
                }
              }
            }
          }
        });

        // For removed keys, we need to also unselect any children and parents of the removed key
        [...removedKeys].forEach((key) => {
          // Grab the option and parents of the option that was removed
          const maybeOptions = findOptions(fieldState.allOptions, key, getOptionValue);
          if (maybeOptions.length === 0) return;

          for (const { option, parents } of maybeOptions) {
            // If the option has children, then we need to unselect those children as well
            if (option.children && option.children.length > 0) {
              // Ensure we do not impact children that are disabled. They shouldn't be able to toggled on/off
              const childrenKeys = option.children
                .flatMap(flattenOptions)
                .map((o) => valueToKey(getOptionValue(o)))
                .filter((key) => !state.disabledKeys.has(key));
              [key, ...childrenKeys].forEach(removedKeys.add, removedKeys);
            }

            // If the option has parents, then we need to unselect those parents as well
            if (parents.length > 0) {
              const parentKeys = parents.map((o) => valueToKey(getOptionValue(o)));
              [key, ...parentKeys].forEach(removedKeys.add, removedKeys);
            }
          }
        });

        // Create the lists to update our TreeState with
        const selectedKeys = new Set([...existingKeys, ...addedKeys].filter((x) => !removedKeys.has(x)));
        const selectedOptions = [...selectedKeys]
          // Find the first option as it could be duplicated, but we only want one of them.
          .map((key) => findOption(fieldState.allOptions, key, getOptionValue)?.option)
          .filter((o) => o) as NestedOption<O>[]; // filter out undefined

        // Our `onSelect` callback provides three things:
        // 1. ALL selected values + options
        // 2. Only the top level selected values + options
        // 3. Only the leaf selected values + options

        // For the top level and leaf selections, we need to do some extra work to determine which options are the top level and leaf.
        const allRootOptions = fieldState.allOptions.flatMap((o) =>
          getTopLevelSelections(o, selectedKeys, getOptionValue),
        );
        // dedupe selected root options
        const rootOptions = allRootOptions.filter(
          (o, idx, self) => idx === self.findIndex((t) => getOptionValue(o) === getOptionValue(t)),
        );
        const rootValues = rootOptions.map(getOptionValue);

        // Finally get the list of options that are just the "leaf" options, meaning they have no children.
        const leafOptions = selectedOptions.filter((o) => !o.children || o.children.length === 0);
        const leafValues = leafOptions.map(getOptionValue);
        const selectedChipState = getSelectedChipState(
          fieldState.allOptions,
          selectedOptions,
          selectedKeys,
          chipDisplay,
          getOptionLabel,
          getOptionValue,
        );

        setFieldState((prevState) => ({
          ...prevState,
          // Since we reset the list of options upon selection changes, then set the `inputValue` to empty string to reflect that.
          inputValue: "",
          searchValue: undefined,
          selectedKeys: [...selectedKeys],
          selectedOptions,
          selectedChipOptions: selectedChipState.options,
          selectedOptionsLabels: selectedChipState.labels,
        }));

        onSelect({
          all: { values: [...selectedKeys].map((key) => keyToValue(key)), options: selectedOptions },
          leaf: { values: leafValues, options: leafOptions },
          root: { values: rootValues, options: rootOptions },
        });
      }
    },
  });

  // Resets the TreeFieldState when the 'blur' event is triggered on the input.
  function resetField() {
    const { inputValue, selectedOptions } = fieldState;
    if (
      inputValue !== nothingSelectedText ||
      (selectedOptions.length === 1 && inputValue !== getOptionLabel(selectedOptions[0]))
    ) {
      setFieldState((prevState) => ({
        ...prevState,
        inputValue:
          selectedOptions.length === 1
            ? getOptionLabel(selectedOptions[0])
            : selectedOptions.length === 0
              ? nothingSelectedText
              : "",
        searchValue: undefined,
        allowCollapsing: true,
      }));
    }
  }

  const comboBoxRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const listBoxRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

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
    // Use toggle() instead of close() to avoid commitValue(), which calls onChange(displayValue)
    // with a potentially stale controlled value. See ComboBoxBase.tsx for details.
    onClose: () => state.toggle(),
    placement: "bottom left",
    offset: borderless ? 8 : 4,
  });

  positionProps.style = {
    ...positionProps.style,
    width: comboBoxRef?.current?.clientWidth,
    // Ensures the menu never gets too small.
    minWidth: 320,
  };

  const fieldMaxWidth = getFieldWidth(fullWidth);

  return (
    <div css={Css.df.fdc.w100.maxw(fieldMaxWidth).if(labelStyle === "left").maxw100.$} ref={comboBoxRef}>
      <ComboBoxInput
        {...otherProps}
        fullWidth={fullWidth}
        labelStyle={labelStyle}
        buttonProps={buttonProps}
        buttonRef={triggerRef}
        inputProps={inputProps}
        inputRef={inputRef}
        inputWrapRef={inputWrapRef}
        listBoxRef={listBoxRef}
        state={state}
        labelProps={labelProps}
        selectedOptions={fieldState.selectedOptions}
        selectedOptionsLabels={fieldState.selectedOptionsLabels}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        contrast={contrast}
        borderless={borderless}
        tooltip={resolveTooltip(disabled, undefined, readOnly)}
        resetField={resetField}
        nothingSelectedText={nothingSelectedText}
        isTree
      />
      {state.isOpen && (
        <Popover
          triggerRef={triggerRef}
          popoverRef={popoverRef}
          positionProps={positionProps}
          // See useOverlayPosition onClose comment above for why toggle vs close.
          onClose={() => state.toggle()}
          isOpen={state.isOpen}
          minWidth={320}
        >
          <ListBox
            {...listBoxProps}
            positionProps={positionProps}
            state={state}
            listBoxRef={listBoxRef}
            selectedOptions={fieldState.selectedChipOptions}
            getOptionLabel={getOptionLabel}
            getOptionValue={(o) => valueToKey(getOptionValue(o))}
            contrast={contrast}
            horizontalLayout={labelStyle === "left"}
            loading={fieldState.optionsLoading}
            allowCollapsing={fieldState.allowCollapsing}
            isTree
          />
        </Popover>
      )}
    </div>
  );
}

function levelOptions<O, V extends Value>(
  o: NestedOption<O>,
  level: number,
  filtering: boolean,
  collapsedKeys: AriaKey[],
  getOptionValue: (o: O) => V,
): LeveledOption<O>[] {
  // If a user is filtering, then do not provide level to the options as the various paddings may look quite odd.
  const actualLevel = filtering ? 0 : level;
  return [
    [o, actualLevel],
    // Flat map the children if the parent is not collapsed or if we are filtering (for the search results)
    ...(o.children?.length && (!collapsedKeys.includes(valueToKey(getOptionValue(o))) || filtering)
      ? o.children.flatMap((oc: NestedOption<O>) =>
          levelOptions(oc, actualLevel + 1, filtering, collapsedKeys, getOptionValue),
        )
      : []),
  ];
}

// Given an option and the selected keys, it will return the top most selected option in the option's tree.
// This could be a parent of the option, or the option itself.
function getTopLevelSelections<O, V extends Value>(
  o: NestedOption<O>,
  selectedKeys: Set<AriaKey>,
  getOptionValue: (o: O) => V,
): NestedOption<O>[] {
  // If this element is already selected, return early. Do not bother looking through children.
  if (selectedKeys.has(valueToKey(getOptionValue(o)))) return [o];
  // If this element has no children, then look through the children for top level selected options.
  if (o.children) return [...o.children.flatMap((c) => getTopLevelSelections(c, selectedKeys, getOptionValue))];
  return [];
}

function getFilteredOptions<O, V extends Value>(
  allOptions: NestedOption<O>[],
  searchValue: string | undefined,
  collapsedKeys: AriaKey[],
  contains: (string: string, substring: string) => boolean,
  getOptionLabel: (o: O) => string,
  getOptionValue: (o: O) => V,
): LeveledOption<O>[] {
  return allOptions.flatMap((option) =>
    levelOptions(option, 0, !!searchValue, collapsedKeys, getOptionValue).filter(([nestedOption]) =>
      searchValue ? contains(getOptionLabel(nestedOption), searchValue) : true,
    ),
  );
}

function isOptionFullySelected<O, V extends Value>(
  option: NestedOption<O>,
  selectedKeys: Set<AriaKey>,
  disabledKeys: Set<AriaKey>,
  groupKeys: Set<AriaKey>,
  getOptionValue: (o: O) => V,
): boolean {
  const key = valueToKey(getOptionValue(option));
  if (groupKeys.has(key)) {
    return option.children?.length
      ? option.children.every((child) =>
          isOptionFullySelected(child, selectedKeys, disabledKeys, groupKeys, getOptionValue),
        )
      : false;
  }
  if (selectedKeys.has(key) || disabledKeys.has(key)) return true;
  if (!option.children || option.children.length === 0) return false;
  return option.children.every((child) =>
    isOptionFullySelected(child, selectedKeys, disabledKeys, groupKeys, getOptionValue),
  );
}

function getSelectedChipState<O, V extends Value>(
  allOptions: NestedOption<O>[],
  selectedOptions: NestedOption<O>[],
  selectedKeys: Set<AriaKey>,
  chipDisplay: "all" | "leaf" | "root",
  getOptionLabel: (o: O) => string,
  getOptionValue: (o: O) => V,
): { options: NestedOption<O>[]; labels: string[] } {
  // `root` mode intentionally collapses a fully-selected subtree into its highest selected ancestor,
  // so the chip UI summarizes the selection instead of repeating every selected descendant.
  const options =
    chipDisplay === "root"
      ? dedupeOptionsByValue(
          allOptions.flatMap((option) => getTopLevelSelections(option, selectedKeys, getOptionValue)),
          getOptionValue,
        )
      : chipDisplay === "leaf"
        ? selectedOptions.filter(isLeafOption)
        : selectedOptions;

  return { options, labels: options.map(getOptionLabel) };
}

/**
 * Dedupe tree selections by value so shared chip rendering shows one chip per logical selection,
 * even when tree traversal yields the same option multiple times.
 */
function dedupeOptionsByValue<O, V extends Value>(
  options: NestedOption<O>[],
  getOptionValue: (o: O) => V,
): NestedOption<O>[] {
  const seen = new Set<AriaKey>();

  return options.filter(function filterOption(option) {
    const key = valueToKey(getOptionValue(option));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isLeafOption<O>(option: NestedOption<O>): boolean {
  return !option.children || option.children.length === 0;
}
