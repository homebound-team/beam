import React, {
  Dispatch,
  Key,
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
import { Item, useComboBoxState, useMultipleSelectionState } from "react-stately";
import { resolveTooltip } from "src/components";
import { Popover } from "src/components/internal";
import { PresentationFieldProps } from "src/components/PresentationContext";
import { Css, px } from "src/Css";
import { Value } from "src/inputs/index";
import { ComboBoxInput } from "src/inputs/internal/ComboBoxInput";
import { ListBox } from "src/inputs/internal/ListBox";
import {
  findOption,
  flattenOptions,
  LeveledOption,
  NestedOption,
  NestedOptionsOrLoad,
  TreeFieldState,
  TreeSelectResponse,
} from "src/inputs/TreeSelectField/utils";
import { keyToValue, valueToKey } from "src/inputs/Value";
import { BeamFocusableProps } from "src/interfaces";
import { HasIdAndName, Optional } from "src/types";

export interface TreeSelectFieldProps<O, V extends Value> extends BeamFocusableProps, PresentationFieldProps {
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
}

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

  const [collapsedKeys, setCollapsedKeys] = useState<Key[]>(
    Array.isArray(options) && defaultCollapsed ? options.map((o) => getOptionValue(o)) : [],
  );
  const contextValue = useMemo<CollapsedChildrenState<O, V>>(
    () => ({ collapsedKeys, setCollapsedKeys, getOptionValue }),
    [collapsedKeys, setCollapsedKeys],
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
  return useContext(CollapsedContext);
}

interface CollapsedChildrenState<O, V extends Value> {
  collapsedKeys: Key[];
  setCollapsedKeys: Dispatch<SetStateAction<Key[]>>;
  getOptionValue: (opt: O) => V;
}
// create the context to hold the collapsed state, default should be false
export const CollapsedContext = React.createContext<CollapsedChildrenState<any, any>>({
  collapsedKeys: [],
  setCollapsedKeys: () => {},
  getOptionValue: () => ({} as any),
});

function TreeSelectFieldBase<O, V extends Value>(props: TreeSelectFieldProps<O, V>) {
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
    defaultCollapsed = false,
    placeholder,
    ...otherProps
  } = props;

  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;
  const initialOptions = Array.isArray(options) ? options : options.initial;
  const { contains } = useFilter({ sensitivity: "base" });

  const { collapsedKeys } = useTreeSelectFieldProvider();

  function levelOptions(o: NestedOption<O>, level: number, filtering?: boolean): LeveledOption<O>[] {
    // If a user is filtering, then do not provide level to the options as the various paddings may look quite odd.
    const actualLevel = filtering ? 0 : level;
    return [
      [o, actualLevel],
      ...(o.children?.length && !collapsedKeys.includes(valueToKey(getOptionValue(o)))
        ? o.children.flatMap((oc: NestedOption<O>) => levelOptions(oc, actualLevel + 1, filtering))
        : []),
    ];
  }

  // Initialize the TreeFieldState
  const [fieldState, setFieldState] = useState<TreeFieldState<O>>(() => {
    const filteredOptions = initialOptions.flatMap((o) => levelOptions(o, 0));
    const selectedOptions: NestedOption<O>[] =
      values?.flatMap((v) => {
        const maybeOption = findOption(initialOptions, valueToKey(v), getOptionValue);
        if (!maybeOption) return [];

        const { option } = maybeOption;
        // If the selected key has children then all children should also be considered selected.
        return [option, ...(option.children?.flatMap(flattenOptions) ?? [])];
      }) ?? [];
    const selectedKeys = selectedOptions.map((o) => valueToKey(getOptionValue(o)));

    // It is possible that all the children of a parent were considered selected `values`, but the parent wasn't.
    // In this case, the parent also should be considered a selected option.
    function areAllChildrenSelected(maybeParent: NestedOption<O>): boolean {
      const isSelected = selectedKeys.includes(valueToKey(getOptionValue(maybeParent)));
      // if this key is already selected, then return true
      if (isSelected) return true;

      // If we do not have children, then return the state of this leaf node.
      if (!maybeParent.children || maybeParent.children.length === 0) return isSelected;

      // If we do have children, then check if all children are selected.
      // if all are selected, then push this parent to the selectedKeys and selectedOptions
      const areAllSelected = maybeParent.children.every(areAllChildrenSelected);
      if (areAllSelected) {
        selectedKeys.push(valueToKey(getOptionValue(maybeParent)));
        selectedOptions.push(maybeParent);
      }
      return areAllSelected;
    }

    initialOptions.forEach(areAllChildrenSelected);

    return {
      selectedKeys,
      inputValue:
        selectedOptions.length === 1
          ? getOptionLabel(selectedOptions[0])
          : selectedOptions.length === 0
          ? nothingSelectedText
          : "",
      filteredOptions,
      selectedOptions,
      allOptions: initialOptions,
      optionsLoading: false,
      allowCollapsing: true,
    };
  });

  // React to collapsed keys and update the filtered options
  const reactToCollapse = useRef(false);
  useEffect(() => {
    // Do not run this effect on first render. Otherwise we'd be triggering a re-render on first render.
    if (reactToCollapse.current) {
      setFieldState(({ allOptions, inputValue, ...others }) => ({
        allOptions,
        inputValue,
        ...others,
        filteredOptions: allOptions.flatMap((o) =>
          levelOptions(o, 0, inputValue.length > 0).filter(([option]) => contains(getOptionLabel(option), inputValue)),
        ),
      }));
    }
    reactToCollapse.current = true;
  }, [collapsedKeys]);

  // Update the filtered options when the input value changes
  const onInputChange = useCallback(
    (inputValue: string) => {
      setFieldState((prevState) => {
        return {
          ...prevState,
          inputValue,
          allowCollapsing: inputValue.length === 0,
          filteredOptions: prevState.allOptions.flatMap((o) =>
            levelOptions(o, 0, inputValue.length > 0).filter(([option]) =>
              contains(getOptionLabel(option), inputValue),
            ),
          ),
        };
      });
    },
    [setFieldState],
  );

  // Handle loading of the options in the case that they are loaded via a Promise.
  const maybeInitLoad = useCallback(
    async (
      options: NestedOptionsOrLoad<O>,
      fieldState: TreeFieldState<O>,
      setFieldState: React.Dispatch<React.SetStateAction<TreeFieldState<O>>>,
    ) => {
      if (!Array.isArray(options)) {
        setFieldState((prevState) => ({ ...prevState, optionsLoading: true }));
        const loadedOptions = (await options.load()).options;
        const filteredOptions = loadedOptions.flatMap((o) =>
          levelOptions(o, 0, fieldState.inputValue.length > 0).filter(([option]) =>
            contains(getOptionLabel(option), fieldState.inputValue),
          ),
        );

        // Ensure the `unset` option is prepended to the top of the list if `unsetLabel` was provided
        setFieldState((prevState) => ({
          ...prevState,
          filteredOptions,
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
      maybeInitLoad(options, fieldState, setFieldState);
      firstOpen.current = false;
    }
    if (isOpen) {
      // reset the input field to allow the user to start typing to filter
      setFieldState((prevState) => ({ ...prevState, inputValue: "" }));
    }
  }

  // This is _always_ going to appear new. Maybe `useMemo`?
  const comboBoxProps = {
    ...otherProps,
    placeholder: !values || values.length === 0 ? placeholder : "",
    label: props.label,
    inputValue: fieldState.inputValue,
    // where we might want to do flatmap and return diff kind of array (children ? add level prop) inside children callback - can put markup wrapper div adds padding
    // so we're not doing it multiple places
    items: fieldState.filteredOptions,
    isDisabled,
    isReadOnly,
    onInputChange,
    onOpenChange,
    children: ([item]: LeveledOption<O>) => (
      // what we're telling it to render. look at padding here - dont have to pass down to tree option - filtered options is where we're flat mapping
      <Item key={valueToKey(getOptionValue(item))} textValue={getOptionLabel(item)}>
        {getOptionMenuLabel(item)}
      </Item>
    ),
  };

  const state = useComboBoxState<any>({
    ...comboBoxProps,
    allowsEmptyCollection: true,
    allowsCustomValue: true,
  });

  // @ts-ignore - `selectionManager.state` exists, but not according to the types. We are tricking the ComboBox state to support multiple selections.
  state.selectionManager.state = useMultipleSelectionState({
    selectionMode: "multiple",
    selectedKeys: fieldState.selectedKeys,
    onSelectionChange: (newKeys) => {
      if (newKeys === "all") {
        // We do not support an "All" option
        return;
      }

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
            selectedKeys: [],
            selectedOptions: [],
          }));
          onSelect({
            all: { values: [], options: [] },
            leaf: { values: [], options: [] },
            root: { values: [], options: [] },
          });
          return;
        }

        // `onSelectionChange` is only ever going to be adding or removing 1 key at a time.
        // The below logic for adding/removing using a forEach loop is just to make TS happy.
        // This may look like a lot of logic, but in the execution it will only ever be adding/removing 1 key at a time, so it really isn't as bad as it looks.

        // For added keys, we need to see if any other options should be added as well.
        [...addedKeys].forEach((key) => {
          const maybeOption = findOption(fieldState.allOptions, key, getOptionValue);
          if (!maybeOption) return;

          const { option, parents } = maybeOption;

          // If the newly added option has children, then consider the children to be newly added keys as well.
          if (option && option.children && option.children.length > 0) {
            const childrenKeys = option.children.flatMap(flattenOptions).map((o) => valueToKey(getOptionValue(o)));
            [key, ...childrenKeys].forEach(addedKeys.add, addedKeys);
          }

          // If this was a child that was selected, then see if every other child is also selected, and if so, consider the parent selected.
          // Walk up the parents and determine their state.
          for (const parent of parents.reverse()) {
            const allChecked = parent.children?.every((child) => {
              const childKey = valueToKey(getOptionValue(child));
              return addedKeys.has(childKey) || existingKeys.has(childKey);
            });
            if (allChecked) {
              addedKeys.add(valueToKey(getOptionValue(parent)));
            }
          }
        });

        // For removed keys, we need to also unselect any children and parents of the removed key
        [...removedKeys].forEach((key) => {
          // Grab the option and parents of the option that was removed
          const maybeOption = findOption(fieldState.allOptions, key, getOptionValue);
          if (!maybeOption) return;

          const { option, parents } = maybeOption;

          // If the option has children, then we need to unselect those children as well
          if (option.children && option.children.length > 0) {
            const childrenKeys = option.children.flatMap(flattenOptions).map((o) => valueToKey(getOptionValue(o)));
            [key, ...childrenKeys].forEach(removedKeys.add, removedKeys);
          }

          // If the option has parents, then we need to unselect those parents as well
          if (parents.length > 0) {
            const parentKeys = parents.map((o) => valueToKey(getOptionValue(o)));
            [key, ...parentKeys].forEach(removedKeys.add, removedKeys);
          }
        });

        // Create the lists to update our TreeState with
        const selectedKeys = new Set([...existingKeys, ...addedKeys].filter((x) => !removedKeys.has(x)));
        const selectedOptions = fieldState.allOptions
          .flatMap(flattenOptions)
          .filter((o) => selectedKeys.has(valueToKey(getOptionValue(o))));

        // Our `onSelect` callback provides three things:
        // 1. ALL selected values + options
        // 2. Only the top level selected values + options
        // 3. Only the leaf selected values + options

        // For the top level and leaf selections, we need to do some extra work to determine which options are the top level and leaf.
        function getTopLevelSelections(o: NestedOption<O>): NestedOption<O>[] {
          // If this element is already selected, return early. Do not bother looking through children.
          if (selectedKeys.has(valueToKey(getOptionValue(o)))) return [o];
          // If this element has no children, then look through the children for top level selected options.
          if (o.children) return [...o.children.flatMap(getTopLevelSelections)];
          return [];
        }
        const rootOptions = fieldState.allOptions.flatMap(getTopLevelSelections);
        const rootValues = rootOptions.map(getOptionValue);

        // Finally get the list of options that are just the "leaf" options, meaning they have no children.
        const leafOptions = selectedOptions.filter((o) => !o.children || o.children.length === 0);
        const leafValues = leafOptions.map(getOptionValue);

        setFieldState((prevState) => ({
          ...prevState,
          selectedKeys: [...selectedKeys],
          selectedOptions,
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
        filteredOptions: initialOptions.flatMap((o) => levelOptions(o, 0)),
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
            allowCollapsing={fieldState.allowCollapsing}
            isTree
          />
        </Popover>
      )}
    </div>
  );
}
