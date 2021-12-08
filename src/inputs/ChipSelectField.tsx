import { camelCase } from "change-case";
import React, { Key, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeProps, useButton, useFocus, useOverlayPosition, useSelect } from "react-aria";
import { Item, Section, useListData, useSelectState } from "react-stately";
import { Icon, Tooltip } from "src/components";
import { Popover } from "src/components/internal";
import { Label } from "src/components/Label";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { ChipTextField } from "src/inputs/ChipTextField";
import { ListBox } from "src/inputs/internal/ListBox";
import { ListBoxChip } from "src/inputs/internal/ListBoxChip";
import { Value, valueToKey } from "src/inputs/Value";
import { Callback, HasIdAndName, Optional } from "src/types";
import { maybeCall, useTestIds } from "src/utils";
import { defaultOptionLabel, defaultOptionValue } from "src/utils/options";

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
  onCreateNew?: (value: string) => Promise<void>;
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
  const firstRender = useRef(true);
  const { fieldProps } = usePresentationContext();
  const {
    label,
    value,
    disabled = false,
    placeholder = "Select an option",
    options,
    onSelect,
    getOptionValue = defaultOptionValue, // if unset, assume O implements HasId
    getOptionLabel = defaultOptionLabel, // if unset, assume O implements HasName
    onFocus,
    onBlur,
    clearable = false,
    onCreateNew,
  } = props;
  const tid = useTestIds(props, "chipSelectField");
  const typeScale = fieldProps?.typeScale ?? "sm";
  const isDisabled = !!disabled;
  const showClearButton = !disabled && clearable && !!value;
  const chipStyles = useMemo(() => Css[typeScale].tl.bgGray300.gray900.br16.pxPx(10).pyPx(2).$, [typeScale]);
  // Controls showing the focus border styles.
  const [visualFocus, setVisualFocus] = useState(false);
  const [isClearFocused, setIsClearFocused] = useState(false);
  const { focusProps } = useFocus({
    onFocus: (e) => {
      // Do not call `onFocus` if focus was returned to the trigger element from the Popover
      if (popoverRef.current && popoverRef.current.contains(e.relatedTarget as HTMLElement)) {
        return;
      }

      maybeCall(onFocus);
    },
    onBlur: (e) => {
      // Do not call onBlur if focus moved to within the Popover
      if (popoverRef.current && popoverRef.current.contains(e.relatedTarget as HTMLElement)) {
        return;
      }

      maybeCall(onBlur);
    },
    // Do not change visual focus state if select menu is opened
    onFocusChange: (isFocused) => !state.isOpen && setVisualFocus(isFocused),
  });
  const { focusProps: clearFocusProps } = useFocus({ onFocusChange: setIsClearFocused });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listBoxRef = useRef(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Using `ListData` in order to dynamically update the items
  const listData = useListData<O | ListBoxSection<O>>({
    initialItems: !onCreateNew
      ? options
      : [
          { title: "Options", options },
          { title: "Actions", isPersistent: true, options: [createNewOpt as unknown as O] },
        ],
    initialSelectedKeys: [valueToKey(value)],
    getKey: (item) => (isListBoxSection(item) ? item.title : getOptionValue(item)),
  });

  useEffect(() => {
    // Avoid unnecessary update of `options` on first render. We define the initial set of items based on the options in the `useListData` hook.
    if (!firstRender.current) {
      if (onCreateNew) {
        // if we have the options in a section, update that section
        listData.update("Options", { title: "Options", options });
      } else {
        // otherwise, reset the list completely. We could traverse through the list and update/add/remove when needed, though this is simpler for now.
        listData.remove(...state.collection.getKeys());
        listData.append(...options);
      }
    }
    firstRender.current = false;
  }, [options]);

  const selectChildren = useMemo(
    () =>
      listData.items.map((s) => {
        if (isListBoxSection(s)) {
          return (
            <Section key={camelCase(s.title)} title={s.title} items={s.options}>
              {(item) => {
                if (isPersistentItem(item)) {
                  return (
                    <Item key={item.id} textValue={item.name}>
                      {item.name}
                    </Item>
                  );
                }

                const label = getOptionLabel(item);
                return (
                  <Item key={getOptionValue(item)} textValue={label}>
                    <ListBoxChip label={label} />
                  </Item>
                );
              }}
            </Section>
          );
        }

        const label = getOptionLabel(s);
        return (
          <Item key={getOptionValue(s)} textValue={label}>
            <ListBoxChip label={label} />
          </Item>
        );
      }),
    [listData.items, getOptionLabel, getOptionValue],
  );

  const selectHookProps = {
    label,
    isDisabled,
    items: listData.items,
    children: selectChildren,
    autoFocus: true,
  };

  const state = useSelectState<any>({
    ...selectHookProps,
    selectedKey: valueToKey(value),
    disallowEmptySelection: false,
    onSelectionChange: (key) => {
      if (key === createNewOpt.id) {
        setShowInput(true);
        return;
      }
      const selectedItem = options.find((o) => getOptionValue(o) === key);
      if (selectedItem) {
        onSelect(key as V, selectedItem);
      }
      // Per UX, when an option is selected then we want to call our `onBlur` callback and remove the focus styles. The field _is_ still in focus but that is only to retain tab position in the DOM.
      // We cannot simply call `buttonRef.current.blur()` here because `state.isOpen === true` and we keep the visualFocus shown when the menu is open.
      setVisualFocus(false);
      maybeCall(onBlur);
    },
    onOpenChange: (isOpen) => {
      if (!isOpen) {
        // When closing, reset the focus to the button element. This is to retain "tab position" in the document, allowing hte user to hit "Tab" and move to the next tabbable element.
        // If the menu closed due to a user selecting an option, then the field will not visually appear focused.
        buttonRef.current?.focus();
      } else {
        // If opened, set visual focus to true. It is possible to be in a state where the browser focus is on this element, but we are not "visually" focused (see `onSelectionChange`). If the user opens the menu again, we should trigger the visual focus.
        setVisualFocus(true);
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
    offset: 8,
  });

  overlayProps.style = {
    ...overlayProps.style,
    width: wrapperRef?.current?.clientWidth,
    // Ensures the menu never gets too small.
    minWidth: 200,
  };

  // State management for the "Create new" flow with ChipTextField.
  const [showInput, setShowInput] = useState(false);
  const removeCreateNewField = useCallback(() => {
    setShowInput(false);
    // Trigger onBlur to initiate any auto-saving behavior.
    maybeCall(onBlur);
  }, [setShowInput]);

  return (
    <>
      {showInput && onCreateNew && (
        <CreateNewField
          onBlur={removeCreateNewField}
          onEnter={async (value) => {
            await onCreateNew(value);
            removeCreateNewField();
          }}
          {...tid.createNewField}
        />
      )}
      <Tooltip
        title={selectHookProps.isDisabled && typeof disabled !== "boolean" ? disabled : undefined}
        placement="top"
      >
        <div
          ref={wrapperRef}
          css={{
            ...chipStyles,
            ...Css.dif.relative.p0.mwPx(32).if(!value).bgGray200.$,
            ...(visualFocus ? Css.bshFocus.$ : {}),
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
            <button
              {...clearFocusProps}
              css={{
                ...Css.prPx(4).borderRadius("0 16px 16px 0").outline0.$,
                "&:hover": Css.bgGray400.$,
                ...(isClearFocused ? Css.boxShadow(`0px 0px 0px 2px rgba(3,105,161,1)`).$ : {}),
              }}
              onClick={() => {
                onSelect(undefined as any, undefined as any);
                maybeCall(onBlur);
                setIsClearFocused(false);
              }}
              aria-label="Remove"
              {...tid.clearButton}
            >
              <Icon icon="x" inc={typeScale === "xs" ? 2 : undefined} />
            </button>
          )}
        </div>
      </Tooltip>
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

type ListBoxSection<O> = { title: string; options: O[]; isPersistent?: boolean };
export function isListBoxSection<O>(obj: O | ListBoxSection<O>): obj is ListBoxSection<O> {
  return typeof obj === "object" && "options" in obj;
}

interface CreateNewFieldProps {
  onBlur: Callback;
  onEnter: (value: string) => {};
}

// Wrapper for the ChipTextField used in the "Create New" flow on ChipSelectField
function CreateNewField(props: CreateNewFieldProps) {
  const { onBlur, onEnter } = props;
  const [value, setValue] = useState<string>("Add new");
  const tid = useTestIds(props);

  return (
    <ChipTextField
      autoFocus
      label="Add new"
      value={value}
      onChange={setValue}
      onEnter={() => onEnter(value)}
      onBlur={onBlur}
      {...tid}
    />
  );
}
