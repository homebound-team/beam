import type { Key } from "@react-types/shared";
import { type KeyboardEvent, type RefObject, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ListKeyboardDelegate, useFilter, useFocusRing, useHover } from "react-aria";
import { Item, type Selection, useListState } from "react-stately";
import { useAiProposal } from "src/inputs/hooks/useAiProposal";
import { disabledOptionToKeyedTuple, initializeOptions } from "src/inputs/internal/selectFieldHelpers";
import type { MenuSearchState } from "src/inputs/MenuSelectField/internal/MenuSearchInput";
import type { MenuSelectTriggerState } from "src/inputs/MenuSelectField/internal/MenuSelectTrigger";
import { type MenuSelectMenu, optionDomId } from "src/inputs/MenuSelectField/internal/OptionList";
import type { MenuSelectFieldProps } from "src/inputs/MenuSelectField/types";
import { type Value, valueToKey } from "src/inputs/Value";
import { maybeCall } from "src/utils/helpers";
import { defaultOptionLabel, defaultOptionValue } from "src/utils/options";

type MenuSelectFieldApi<O> = {
  triggerRef: RefObject<HTMLButtonElement | null>;
  trigger: MenuSelectTriggerState;
  searchRef: RefObject<HTMLInputElement | null>;
  search: MenuSearchState;
  listRef: RefObject<HTMLDivElement | null>;
  menu: MenuSelectMenu<O>;
};

/** Options, search, selection, and keyboard behavior for a menu select. */
export function useMenuSelectField<O, V extends Value>(props: MenuSelectFieldProps<O, V>): MenuSelectFieldApi<O> {
  const {
    options: optionsProp,
    getOptionValue = defaultOptionValue as (opt: O) => V,
    getOptionLabel = defaultOptionLabel as (opt: O) => string,
    getOptionMenuLabel,
    getOptionSearchText,
    disabledOptions,
    nothingSelectedText = "",
    placeholder,
    disabled,
    readOnly,
    onFocus,
    onBlur,
    value: propValue,
    proposedValue,
    onSelect,
  } = props;
  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;

  const fieldId = useId();
  const listId = `${fieldId}-listbox`;
  const triggerId = `${fieldId}-trigger`;
  const labelId = `${fieldId}-label`;
  const valueId = `${fieldId}-value`;
  const errorId = `${fieldId}-error`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  // Tracks field-level focus across the trigger and the portaled menu, so onFocus/onBlur fire once per visit.
  const hasFocusRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(false);
  const didRequestOptionsRef = useRef(false);
  const options = useMemo(
    () => initializeOptions(optionsProp, getOptionValue, getOptionLabel, undefined, false),
    // getOptionValue and getOptionLabel are typically inline lambdas
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [optionsProp],
  );
  const { hoverProps, isHovered } = useHover({});
  const { focusProps, isFocusVisible } = useFocusRing();
  const { contains } = useFilter({ sensitivity: "base" });

  const optionsByKey = useMemo(
    () => new Map(options.map((o) => [valueToKey(getOptionValue(o)), o])),
    // getOptionValue is typically an inline lambda
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [options],
  );
  // Selection, trigger text, and the menu's checks all follow the proposal until the user picks something.
  const { effectiveValue: value, proposalProps } = useAiProposal(propValue, proposedValue, (v) => {
    const option = optionsByKey.get(valueToKey(v));
    return option === undefined ? undefined : getOptionLabel(option);
  });
  const selectedKeys = useMemo(() => new Set(value === undefined ? [] : [valueToKey(value)]), [value]);
  const filteredOptions = useMemo(
    () =>
      search ? options.filter((o) => matchesSearch(o, search, getOptionLabel, getOptionSearchText, contains)) : options,
    // getOptionLabel and getOptionSearchText are typically inline lambdas
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [options, search, contains],
  );
  const [disabledKeys, disabledReasons] = useMemo(() => {
    const tuples = (disabledOptions ?? []).map(disabledOptionToKeyedTuple);
    return [tuples.map(([k]) => String(k)), Object.fromEntries(tuples.map(([k, r]) => [String(k), r]))];
  }, [disabledOptions]);

  function onSelectionChange(keys: Selection) {
    if (keys === "all") return;
    const [key] = [...keys];
    // Re-selecting the current value toggles it off in react-stately; treat that as "keep it" and close.
    if (key === undefined) {
      close({ restoreFocus: true });
      return;
    }
    const opt = optionsByKey.get(String(key));
    proposalProps.onUserEdit?.();
    onSelect(opt === undefined ? undefined : getOptionValue(opt), opt);
    close({ restoreFocus: true });
  }

  const state = useListState<O>({
    items: filteredOptions,
    children: (o: O) => (
      <Item key={valueToKey(getOptionValue(o))} textValue={getOptionLabel(o)}>
        {getOptionMenuLabel ? getOptionMenuLabel(o) : getOptionLabel(o)}
      </Item>
    ),
    selectionMode: "single",
    selectedKeys,
    disabledKeys,
    onSelectionChange,
  });
  const { selectionManager } = state;

  const keyboardDelegate = useMemo(
    () =>
      new MenuSelectKeyboardDelegate<O>({
        collection: state.collection,
        disabledKeys: state.disabledKeys,
        ref: listRef,
      }),
    [state.collection, state.disabledKeys],
  );

  function open() {
    if (isDisabled || isReadOnly) return;
    setSearch("");
    setIsOpen(true);
    if (didRequestOptionsRef.current || Array.isArray(optionsProp)) return;
    didRequestOptionsRef.current = true;
    setOptionsLoading(true);
    void optionsProp.load().finally(() => setOptionsLoading(false));
  }

  function close(opts: { restoreFocus: boolean }) {
    setIsOpen(false);
    setSearch("");
    if (opts.restoreFocus) {
      triggerRef.current?.focus({ preventScroll: true });
    } else if (hasFocusRef.current) {
      settleBlur();
    }
  }

  function settleBlur() {
    hasFocusRef.current = false;
    maybeCall(proposalProps.onUserBlur);
    maybeCall(onBlur);
  }

  // Menus this size and smaller skip search. The count is the list in the menu, including a not-yet-loaded `current`.
  const showSearch = options.length > searchOptionLimit;

  // Focus the search, or the list when there is no search. Leave option focus unset until a keyboard move.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const keyTarget = showSearch ? searchRef.current : listRef.current;
    keyTarget?.focus({ preventScroll: true });
    selectionManager.setFocusedKey(null);
    selectionManager.setFocused(false);
    // Only on open, and when search appears after a lazy load. Later selection changes shouldn't move focus.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, showSearch]);

  // Typing starts a new list, so drop any keyboard highlight until the next arrow.
  function onSearchChange(value: string) {
    setSearch(value);
    selectionManager.setFocusedKey(null);
    selectionManager.setFocused(false);
  }

  function focusKey(key: Key | null) {
    if (key == null) return;
    // `isFocused` is what paints the row. Set it here so open and search can leave it off.
    selectionManager.setFocused(true);
    selectionManager.setFocusedKey(key);
  }

  function onMenuKeyDown(e: KeyboardEvent<HTMLElement>) {
    const current = selectionManager.focusedKey;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusKey(
          current == null
            ? keyboardDelegate.getFirstKey()
            : (keyboardDelegate.getKeyBelow(current) ?? keyboardDelegate.getFirstKey()),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        focusKey(
          current == null
            ? keyboardDelegate.getLastKey()
            : (keyboardDelegate.getKeyAbove(current) ?? keyboardDelegate.getLastKey()),
        );
        break;
      case "PageDown":
        e.preventDefault();
        focusKey(current == null ? keyboardDelegate.getFirstKey() : keyboardDelegate.getKeyPageBelow(current));
        break;
      case "PageUp":
        e.preventDefault();
        focusKey(current == null ? keyboardDelegate.getLastKey() : keyboardDelegate.getKeyPageAbove(current));
        break;
      case "Home":
        e.preventDefault();
        focusKey(keyboardDelegate.getFirstKey());
        break;
      case "End":
        e.preventDefault();
        focusKey(keyboardDelegate.getLastKey());
        break;
      case "Enter": {
        e.preventDefault();
        const key = selectionManager.focusedKey;
        if (key != null && !state.disabledKeys.has(key)) selectionManager.select(key);
        break;
      }
      case "Escape":
        e.preventDefault();
        // Keep an enclosing Modal from also closing.
        e.stopPropagation();
        close({ restoreFocus: true });
        break;
      case "Tab":
        // The menu is portaled to the end of <body>; tabbing out would leave the page, so return to the trigger.
        e.preventDefault();
        close({ restoreFocus: true });
        break;
      default:
        break;
    }
  }

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    // Enter and Space activate the button's click. Arrows only open.
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      open();
    }
  }

  function onTriggerFocus() {
    if (hasFocusRef.current) return;
    hasFocusRef.current = true;
    maybeCall(onFocus);
  }

  function onTriggerBlur() {
    // Moving into the open menu keeps the field "focused"; close() settles blur otherwise.
    if (isOpen) return;
    settleBlur();
  }

  const focusedKey = selectionManager.focusedKey;
  const focusedIndex = focusedKey != null ? state.collection.getItem(focusedKey)?.index : undefined;
  const activeDescendant = isOpen && focusedIndex !== undefined ? optionDomId(listId, focusedIndex) : undefined;
  const initialIndex = Math.max(
    0,
    filteredOptions.findIndex((o) => selectedKeys.has(valueToKey(getOptionValue(o)))),
  );

  const selectedOption = value === undefined ? undefined : optionsByKey.get(valueToKey(value));
  const selectedText = selectedOption === undefined ? "" : getOptionLabel(selectedOption);
  const displayText = selectedText || nothingSelectedText || placeholder || "";
  const isPlaceholder = !selectedText && !nothingSelectedText && !!placeholder;

  const triggerProps: MenuSelectTriggerState = {
    isDisabled,
    isReadOnly,
    isOpen,
    listId,
    triggerId,
    labelId,
    valueId,
    errorId,
    hoverProps,
    focusProps,
    isFocusVisible,
    isHovered,
    open,
    close,
    onKeyDown: onTriggerKeyDown,
    onFocus: onTriggerFocus,
    onBlur: onTriggerBlur,
    displayText,
    isPlaceholder,
    proposalProps,
  };
  const searchProps: MenuSearchState = {
    show: showSearch,
    value: search,
    onChange: onSearchChange,
    listId,
    activeDescendant,
    onKeyDown: onMenuKeyDown,
  };
  const menuProps: MenuSelectMenu<O> = {
    isOpen,
    close,
    listId,
    state,
    loading: optionsLoading,
    disabledReasons,
    initialIndex,
    onKeyDown: onMenuKeyDown,
    activeDescendant,
  };

  // Refs stay beside each group. An object that holds a ref is itself a ref, so reading it during render is invalid.
  return { triggerRef, trigger: triggerProps, searchRef, search: searchProps, listRef, menu: menuProps };
}

function matchesSearch<O>(
  option: O,
  query: string,
  getOptionLabel: (opt: O) => string,
  getOptionSearchText: ((opt: O) => string | readonly string[]) | undefined,
  contains: (text: string, substring: string) => boolean,
): boolean {
  if (contains(getOptionLabel(option), query)) return true;
  const extra = getOptionSearchText?.(option);
  const terms = typeof extra === "string" ? [extra] : extra;
  return terms?.some((term) => contains(term, query)) ?? false;
}

/** Menus with this many options or fewer omit the search field. */
const searchOptionLimit = 8;

/**
 * Reuses React Aria's `ListKeyboardDelegate` for arrows, Home, and End.
 * Page Up/Down measure rendered rows, which under-counts a virtualized list, so those step 10 keys instead.
 */
class MenuSelectKeyboardDelegate<T> extends ListKeyboardDelegate<T> {
  /** Rows skipped by Page Up / Page Down. */
  private static readonly pageSize = 10;

  override getKeyPageBelow(key: Key): Key | null {
    return this.stepKeys(key, "below");
  }

  override getKeyPageAbove(key: Key): Key | null {
    return this.stepKeys(key, "above");
  }

  private stepKeys(key: Key, direction: "below" | "above"): Key | null {
    let next: Key | null = key;
    for (let index = 0; index < MenuSelectKeyboardDelegate.pageSize; index += 1) {
      if (next == null) return next;
      const candidate: Key | null = direction === "below" ? this.getKeyBelow(next) : this.getKeyAbove(next);
      if (candidate == null) return next;
      next = candidate;
    }
    return next;
  }
}
