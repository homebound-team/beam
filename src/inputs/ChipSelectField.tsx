import React, { Key, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { mergeProps, useButton, useFocus, useOverlayPosition, useSelect } from "react-aria";
import { Item, useListData, useSelectState } from "react-stately";
import { Icon, Tooltip } from "src/components";
import { Popover } from "src/components/internal";
import { Label } from "src/components/Label";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { ChipTextField } from "src/inputs/ChipTextField";
import { ListBox } from "src/inputs/internal/ListBox";
import { Value, valueToKey } from "src/inputs/Value";
import { HasIdAndName, Optional } from "src/types";
import { maybeCall, useTestIds } from "src/utils";

export interface ChipSelectFieldProps<O, V extends Value> {
  label: string;
  value: V;
  options: O[];
  placeholder?: string;
  onSelect: (value: V, opt: O | undefined) => void;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  // Callback fired when focus removes from the input
  onBlur?: () => void;
  // Callback fired when focus is set to the input
  onFocus?: () => void;
  // Whether to show the "X"/clear button on the Chip
  clearable?: boolean;
  // If set, appends "Create new" option to list. When "Create new" is chosen, then the SelectField is replaced with the ChipTextField for creating a new option.
  onCreateNew?: (value: string) => Promise<O>;
  // Whether the Button is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip.
  disabled?: boolean | ReactNode;
}

export function ChipSelectField<O, V extends Value>(props: ChipSelectFieldProps<O, V>): JSX.Element;
export function ChipSelectField<O extends HasIdAndName<V>, V extends Value>(
  props: Optional<ChipSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function ChipSelectField<O, V extends Value>(
  props: Optional<ChipSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const { fieldProps } = usePresentationContext();
  const {
    label,
    value,
    disabled = false,
    placeholder = "Select an option",
    options,
    onSelect,
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName
    onFocus,
    onBlur,
    clearable = false,
    onCreateNew,
  } = props;
  const tid = useTestIds(props, "chipSelectField");
  const typeScale = fieldProps?.typeScale ?? "sm";
  const isDisabled = !!disabled;
  const showClearButton = !disabled && clearable && !!value;
  const chipStyles = Css[typeScale].tl.bgGray300.gray900.br16.pxPx(10).pyPx(2).$;
  const [isFocused, setIsFocused] = useState(false);
  const [isClearFocused, setIsClearFocused] = useState(false);
  const { focusProps } = useFocus({
    onFocus: (e) => {
      // Do not call `onFocus` if focus was returned to the trigger element from the Popover
      if (popoverRef.current && popoverRef.current.contains(e.relatedTarget as HTMLElement)) {
        return;
      }

      maybeCall(onFocus);
    },
    // Do not call onBlur if we just opened the menu
    onBlur: () => !state.isOpen && maybeCall(onBlur),
    // Do not change focus state if select menu is opened
    onFocusChange: (isFocused) => !state.isOpen && setIsFocused(isFocused),
  });
  const { focusProps: clearFocusProps } = useFocus({ onFocusChange: setIsClearFocused });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listBoxRef = useRef(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Using `ListData` in order to dynamically update the items
  const listData = useListData({
    initialItems: [...options, ...(onCreateNew ? [createNewOpt as unknown as O] : [])],
    initialSelectedKeys: [valueToKey(value)],
    getKey: (item) => (isPersistentItem(item) ? item.id : getOptionValue(item)),
  });

  // If the options change, blow away existing items and replace with new values.
  useEffect(() => {
    // Create a list of all existing keys to be removed.
    const optionKeys = listData.items.reduce(
      // Filter out Persistent Items
      (acc, o) => (isPersistentItem(o) ? acc : acc.concat(getOptionValue(o))),
      [] as Key[],
    );

    listData.remove(...optionKeys);

    // Using `prepend` to keep Persistent Items (if they exist) at the bottom of the list.
    listData.prepend(...options);
  }, [options]);

  const selectChildren = listData.items.map((o) => {
    const isPersistent = isPersistentItem(o);
    const value = isPersistent ? o.id : getOptionValue(o);
    const label = isPersistent ? o.name : getOptionLabel(o);
    return (
      <Item key={value} textValue={label}>
        {isPersistent ? (
          label
        ) : (
          <span css={{ ...Css.lineClamp1.breakAll.$, ...chipStyles }} title={label}>
            {label}
          </span>
        )}
      </Item>
    );
  });

  const selectHookProps = {
    label,
    isDisabled,
    items: listData.items,
    children: selectChildren,
  };

  const state = useSelectState<any>({
    ...selectHookProps,
    autoFocus: false,
    selectedKey: valueToKey(value),
    disallowEmptySelection: true,
    onSelectionChange: (key) => {
      if (key === createNewOpt.id) {
        setShowInput(true);
        return;
      }
      const selectedItem = options.find((o) => getOptionValue(o) === key);
      if (selectedItem) {
        onSelect(key as V, selectedItem);
      }
    },
    onOpenChange: (isOpen) => {
      if (!isOpen && buttonRef.current) {
        // When closing reset the focus to the button element.
        buttonRef.current.focus();
      }
    },
  });
  const { labelProps, triggerProps, valueProps, menuProps } = useSelect(selectHookProps, state, buttonRef);
  const { buttonProps } = useButton({ ...triggerProps, isDisabled }, buttonRef);
  const { overlayProps } = useOverlayPosition({
    targetRef: buttonRef,
    overlayRef: popoverRef,
    scrollRef: listBoxRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
    placement: "bottom left",
  });

  overlayProps.style = {
    ...overlayProps.style,
    width: wrapperRef?.current?.clientWidth,
    // Ensures the menu never gets too small.
    minWidth: 200,
  };

  // State management for the "Create new" flow with ChipTextField.
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState<string>("Add new");
  const removeCreateNewField = useCallback(() => {
    setShowInput(false);
    setInputValue("Add new");
    buttonRef.current?.focus();
  }, [setShowInput, setInputValue]);

  const field = (
    <>
      {showInput && onCreateNew && (
        <ChipTextField
          autoFocus
          label="Add new"
          value={inputValue}
          onChange={setInputValue}
          onEnter={async () => {
            const newOption = await onCreateNew(inputValue);
            listData.insertBefore(createNewOpt.id, newOption);
            removeCreateNewField();
          }}
          onBlur={removeCreateNewField}
          {...tid.createNewField}
        />
      )}
      <div
        ref={wrapperRef}
        css={{
          ...chipStyles,
          ...Css.dif.relative.p0.mwPx(32).if(!value).bgGray200.$,
          ...(isFocused ? Css.bshFocus.$ : {}),
          ...(showInput ? Css.dn.$ : {}),
        }}
      >
        <Label label={label} labelProps={labelProps} hidden {...tid.label} />
        <button
          {...mergeProps(focusProps, buttonProps)}
          ref={buttonRef}
          css={{
            ...Css.tl.br16.pxPx(10).pyPx(2).outline0.if(showClearButton).prPx(4).borderRadius("16px 0 0 16px").$,
            ...(isDisabled ? Css.cursorNotAllowed.gray700.$ : {}),
            "&:hover:not(:disabled)": Css.bgGray400.if(!value).bgGray300.$,
          }}
          title={state.selectedItem ? state.selectedItem.textValue : placeholder}
          {...tid}
        >
          <span {...valueProps} css={Css.lineClamp1.breakAll.$}>
            {state.selectedItem ? state.selectedItem.textValue : placeholder}
          </span>
        </button>
        {showClearButton && (
          // Apply a tabIndex=-1 to remove need for addresses this focus behavior separately from the rest of the button.
          // This will require the user to click on the button if they want to remove it.
          <button
            {...clearFocusProps}
            css={{
              ...Css.prPx(4).borderRadius("0 16px 16px 0").outline0.$,
              "&:hover": Css.bgGray400.$,
              ...(isClearFocused ? Css.boxShadow(`0px 0px 0px 2px rgba(3,105,161,1)`).$ : {}),
            }}
            onClick={() => {
              onSelect(undefined as any, undefined as any);
              setIsClearFocused(false);
            }}
            aria-label="Remove"
            {...tid.clearButton}
          >
            <Icon icon="x" inc={typeScale === "xs" ? 2 : undefined} />
          </button>
        )}
      </div>
      {state.isOpen && (
        <Popover
          triggerRef={buttonRef}
          popoverRef={popoverRef}
          positionProps={overlayProps}
          onClose={state.close}
          isOpen={state.isOpen}
          shouldCloseOnBlur={true}
        >
          <ListBox
            {...menuProps}
            listBoxRef={listBoxRef}
            state={state}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            positionProps={overlayProps}
          />
        </Popover>
      )}
    </>
  );

  const tooltipText = selectHookProps.isDisabled && typeof disabled !== "boolean" ? disabled : undefined;
  return tooltipText ? (
    <Tooltip title={tooltipText} placement="top">
      {field}
    </Tooltip>
  ) : (
    field
  );
}

export const persistentItemPrefix = "persistentItem:";
type PersistentItem = { id: string; name: string };
const createNewOpt = {
  id: `${persistentItemPrefix}createNew`,
  name: "Create new",
};

export function isPersistentItem<T extends PersistentItem>(opt: any): opt is PersistentItem {
  return typeof opt === "object" && "id" in opt && isPersistentKey(opt.id);
}

export function isPersistentKey(key: Key): boolean {
  return typeof key === "string" && key.startsWith(persistentItemPrefix);
}
