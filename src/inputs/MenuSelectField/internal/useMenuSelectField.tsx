import type { Key } from "@react-types/shared";
import { type KeyboardEvent, type RefObject, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ListKeyboardDelegate, useFilter, useFocusRing, useHover } from "react-aria";
import { Item, type Selection, useListState } from "react-stately";
import { useAiProposal } from "src/inputs/hooks/useAiProposal";
import { disabledOptionToKeyedTuple, initializeOptions } from "src/inputs/internal/selectFieldHelpers";
import type { MenuSearchState } from "src/inputs/MenuSelectField/internal/MenuSearchInput";
import type { MenuSelectedOption } from "src/inputs/MenuSelectField/internal/MenuSelectedPills";
import type { MenuSelectTriggerState } from "src/inputs/MenuSelectField/internal/MenuSelectTrigger";
import {
  buildMenuTree,
  initialExpandedKeys,
  type MenuTree,
  type MenuTreeNode,
  normalizeTreeSelection,
  partiallySelectedKeys,
  selectedTreeOptions,
  toggleTreeSelection,
} from "src/inputs/MenuSelectField/internal/menuTree";
import { bucketTreeSelection, visibleNestedRows } from "src/inputs/MenuSelectField/internal/nestedRows";
import { type MenuSelectMenu, optionDomId } from "src/inputs/MenuSelectField/internal/OptionList";
import type { MenuOptionItem, MenuSelectControllerProps } from "src/inputs/MenuSelectField/types";
import { type Value, valueToKey } from "src/inputs/Value";
import { maybeCall } from "src/utils/helpers";
import { defaultOptionLabel, defaultOptionValue } from "src/utils/options";
import { useDebouncedCallback } from "use-debounce";

type MenuSelectFieldApi<O> = {
  triggerRef: RefObject<HTMLButtonElement | null>;
  trigger: MenuSelectTriggerState;
  searchRef: RefObject<HTMLInputElement | null>;
  search: MenuSearchState;
  listRef: RefObject<HTMLDivElement | null>;
  menu: MenuSelectMenu<O>;
  /** Pills for the open menu. A tree lists its `selectionDisplay` bucket, the same options as the count badge. Empty for a single select. */
  selections: { options: MenuSelectedOption[]; onDeselect: (key: string) => void };
};

/** Menu select state: options, search, selection, and keyboard behavior. Own hook instead of React Stately's, because the trigger is a button that opens a searchable menu. */
export function useMenuSelectField<O, V extends Value>(props: MenuSelectControllerProps<O, V>): MenuSelectFieldApi<O> {
  const {
    options: optionsProp,
    getOptionValue = defaultOptionValue as (opt: O) => V,
    getOptionLabel = defaultOptionLabel as (opt: O) => string,
    getOptionMenuLabel,
    getOptionSearchText,
    autoSort = true,
    onSearch,
    disabledOptions,
    nothingSelectedText = "",
    placeholder,
    disabled,
    readOnly,
    onFocus,
    onBlur,
    selectionMode,
    values: propValues,
    proposedValues,
    onCommit,
    tree,
    hierarchy,
  } = props;
  const multiple = selectionMode === "multiple";
  // `onSearch` means the caller fetches matches. The menu lists `options` as given.
  const serverSearch = onSearch !== undefined;
  const getChildren = tree?.getChildren ?? hierarchy?.getChildren;
  const defaultExpanded = tree?.defaultExpanded ?? false;
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
  // Last text passed to `onSearch`. `undefined` means the caller has not been queried, so opening does not send `""`.
  const sentSearchRef = useRef<string | undefined>(undefined);
  // Calls `onSearch` after `onSearchDelay` of quiet typing. The helper keeps the latest callback.
  const debouncedOnSearch = useDebouncedCallback((value: string) => {
    // Avoid calling `onSearch` if it hasn't changed.
    // This can happen when someone types, the query goes out, then they edit and end up back on the same text before the next delay elapses. The second timer fires with the same string, and this return keeps it from querying again.
    if (!onSearch || value === sentSearchRef.current) return;
    // Typing and deleting before the delay elapses never queried, so skip the empty text.
    if (value === "" && sentSearchRef.current === undefined) return;
    sentSearchRef.current = value;
    onSearch(value);
  }, onSearchDelay);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(false);
  const didRequestOptionsRef = useRef(false);
  const options = useMemo(
    () => initializeOptions(optionsProp, getOptionValue, getOptionLabel, undefined, autoSort),
    // getOptionValue and getOptionLabel are typically inline lambdas
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [optionsProp, autoSort],
  );
  const { hoverProps, isHovered } = useHover({});
  const { focusProps, isFocusVisible } = useFocusRing();
  const { contains } = useFilter({ sensitivity: "base" });

  // For a tree, `options` are the roots; `allOptions` is every node in render order.
  const menuTree = useMemo(
    () => (getChildren ? buildMenuTree(options, (o) => valueToKey(getOptionValue(o)), getChildren) : undefined),
    // getOptionValue is typically an inline lambda
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [options, getChildren],
  );
  const allOptions = useMemo(
    () => (menuTree ? menuTree.orderedKeys.map((k) => menuTree.nodes.get(k)!.option) : options),
    [menuTree, options],
  );
  const optionsByKey = useMemo(
    () => new Map(allOptions.map((o) => [valueToKey(getOptionValue(o)), o])),
    // getOptionValue is typically an inline lambda
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [allOptions],
  );
  const [disabledKeys, disabledReasons] = useMemo(() => {
    const tuples = (disabledOptions ?? []).map(disabledOptionToKeyedTuple);
    return [tuples.map(([k]) => String(k)), Object.fromEntries(tuples.map(([k, r]) => [String(k), r]))];
  }, [disabledOptions]);
  const disabledKeySet = useMemo(() => new Set(disabledKeys), [disabledKeys]);
  // Selection, trigger text, and the menu's checks all follow the proposal until the user picks something.
  const { effectiveValue, proposalProps } = useAiProposal(propValues, proposedValues, (vs) =>
    labelsFor(vs, allOptions, getOptionValue, (option) =>
      hierarchy && menuTree
        ? (hierarchyPathLabel(menuTree, valueToKey(getOptionValue(option)), getOptionLabel) ?? getOptionLabel(option))
        : getOptionLabel(option),
    ).join(", "),
  );
  const values = useMemo(() => effectiveValue ?? [], [effectiveValue]);
  const selectedKeys = useMemo(
    () =>
      menuTree && !hierarchy
        ? normalizeTreeSelection(menuTree, values.map(valueToKey), disabledKeySet)
        : new Set(values.map(valueToKey)),
    [menuTree, hierarchy, values, disabledKeySet],
  );
  // The list keys each copy, so a repeated value can render under every parent. Selection itself stays by value.
  const selectedRowKeys = useMemo(
    () =>
      menuTree
        ? new Set(menuTree.orderedKeys.filter((key) => selectedKeys.has(menuTree.nodes.get(key)!.valueKey)))
        : selectedKeys,
    [menuTree, selectedKeys],
  );
  const disabledRowKeys = useMemo(
    () =>
      menuTree
        ? menuTree.orderedKeys.filter((key) => disabledKeySet.has(menuTree.nodes.get(key)!.valueKey))
        : disabledKeys,
    [menuTree, disabledKeySet, disabledKeys],
  );
  const selectedOptions = useMemo(
    () =>
      menuTree
        ? selectedTreeOptions(menuTree, selectedKeys)
        : values.map((v) => optionsByKey.get(valueToKey(v))).filter((o): o is O => o !== undefined),
    [menuTree, selectedKeys, values, optionsByKey],
  );

  // Groups start collapsed, unless `defaultExpanded` or they hold a selection. Searching expands every match.
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(() =>
    menuTree ? initialExpandedKeys(menuTree, selectedKeys, defaultExpanded) : new Set(),
  );
  const [searchCollapsedKeys, setSearchCollapsedKeys] = useState<ReadonlySet<string>>(() => new Set());
  const isExpanded = (key: string) => (!serverSearch && search ? !searchCollapsedKeys.has(key) : expandedKeys.has(key));

  const treeRows = useMemo(() => {
    if (!menuTree) return undefined;
    const roots = rootNodes(menuTree);
    const matchKeys =
      search && !serverSearch
        ? new Set(
            allOptions
              .filter((o) => matchesSearch(o, search, getOptionLabel, getOptionSearchText, contains))
              .map((o) => valueToKey(getOptionValue(o))),
          )
        : undefined;
    return visibleNestedRows(
      roots,
      (node) => childNodes(menuTree, node),
      hierarchy ? () => true : (node) => isExpanded(node.key),
      matchKeys ? (node) => matchKeys.has(node.valueKey) : undefined,
    );
    // isExpanded reads the two key sets below; the option callbacks are typically inline lambdas
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [menuTree, hierarchy, allOptions, search, serverSearch, contains, expandedKeys, searchCollapsedKeys]);
  const filteredOptions = useMemo(
    () =>
      menuTree || !search || serverSearch
        ? options
        : options.filter((o) => matchesSearch(o, search, getOptionLabel, getOptionSearchText, contains)),
    // getOptionLabel and getOptionSearchText are typically inline lambdas
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [menuTree, options, search, serverSearch, contains],
  );

  function onSelectionChange(keys: Selection) {
    if (keys === "all") return;
    if (menuTree && !hierarchy) {
      // react-stately toggles one row. That row's value selects or clears every copy.
      const added = [...keys].map(String).find((key) => !selectedRowKeys.has(key));
      const removed = [...selectedRowKeys].find((key) => !keys.has(key));
      const key = added ?? removed;
      const valueKey = key === undefined ? undefined : menuTree.nodes.get(key)?.valueKey;
      if (valueKey === undefined) return;
      const next = toggleTreeSelection(menuTree, selectedKeys, valueKey, added !== undefined, disabledKeySet);
      const nextOptions = selectedTreeOptions(menuTree, next);
      proposalProps.onUserEdit?.();
      onCommit(nextOptions.map(getOptionValue), nextOptions);
      return;
    }
    if (!multiple) {
      const [key] = [...keys];
      // Re-selecting the current value toggles it off in react-stately; treat that as "keep it" and close.
      if (key === undefined) {
        close({ restoreFocus: true });
        return;
      }
      const opt = menuTree ? menuTree.nodes.get(String(key))?.option : optionsByKey.get(String(key));
      proposalProps.onUserEdit?.();
      onCommit(opt === undefined ? [] : [getOptionValue(opt)], opt === undefined ? [] : [opt]);
      close({ restoreFocus: true });
      return;
    }
    // `keys` still holds selections the search hides; react-stately only toggles the pressed key.
    const next = values.filter((v) => keys.has(valueToKey(v)));
    for (const k of keys) {
      const opt = optionsByKey.get(String(k));
      if (opt !== undefined && !selectedKeys.has(String(k))) next.push(getOptionValue(opt));
    }
    proposalProps.onUserEdit?.();
    onCommit(
      next,
      next.map((v) => optionsByKey.get(valueToKey(v))).filter((o): o is O => o !== undefined),
    );
  }

  const collectionItems = useMemo((): MenuOptionItem<O>[] => {
    if (treeRows) {
      return treeRows.map(({ node }) => ({ key: node.key, valueKey: node.valueKey, option: node.option }));
    }
    return filteredOptions.map((option) => {
      const valueKey = valueToKey(getOptionValue(option));
      return { key: valueKey, valueKey, option };
    });
    // getOptionValue is typically an inline lambda
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [treeRows, filteredOptions]);

  const state = useListState<MenuOptionItem<O>>({
    items: collectionItems,
    children: (item) => (
      <Item key={item.key} textValue={getOptionLabel(item.option)}>
        {getOptionMenuLabel ? getOptionMenuLabel(item.option) : getOptionLabel(item.option)}
      </Item>
    ),
    selectionMode: multiple ? "multiple" : "single",
    selectedKeys: selectedRowKeys,
    disabledKeys: disabledRowKeys,
    onSelectionChange,
  });
  const { selectionManager } = state;

  const keyboardDelegate = useMemo(
    () =>
      new MenuSelectKeyboardDelegate<MenuOptionItem<O>>({
        collection: state.collection,
        disabledKeys: state.disabledKeys,
        ref: listRef,
      }),
    [state.collection, state.disabledKeys],
  );

  function open() {
    if (isDisabled || isReadOnly) return;
    setSearch("");
    if (menuTree) {
      setExpandedKeys(initialExpandedKeys(menuTree, selectedKeys, defaultExpanded));
      setSearchCollapsedKeys(new Set());
    }
    setIsOpen(true);
    if (didRequestOptionsRef.current || Array.isArray(optionsProp)) return;
    didRequestOptionsRef.current = true;
    setOptionsLoading(true);
    void optionsProp.load().finally(() => setOptionsLoading(false));
  }

  function close(opts: { restoreFocus: boolean }) {
    debouncedOnSearch.cancel();
    setIsOpen(false);
    setSearch("");
    // A search already sent has to be reset now. A pending keystroke was cancelled above.
    if (onSearch && sentSearchRef.current) {
      sentSearchRef.current = "";
      onSearch("");
    }
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

  // Short menus skip search, unless `onSearch` refetches. The count includes a not-yet-loaded `current`.
  const showSearch = serverSearch || allOptions.length > searchOptionLimit;

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
    setSearchCollapsedKeys(new Set());
    selectionManager.setFocusedKey(null);
    selectionManager.setFocused(false);
    if (onSearch) debouncedOnSearch(value);
  }

  function focusKey(key: Key | null) {
    if (key == null) return;
    // `isFocused` is what paints the row. Set it here so open and search can leave it off.
    selectionManager.setFocused(true);
    selectionManager.setFocusedKey(key);
  }

  function setTreeExpanded(key: string, expand: boolean) {
    if (search) setSearchCollapsedKeys((prev) => withKey(prev, key, !expand));
    else setExpandedKeys((prev) => withKey(prev, key, expand));
    // Collapsing would hide a focused descendant, so focus moves up to the group.
    const focused = selectionManager.focusedKey;
    if (!expand && menuTree && focused != null && isDescendant(menuTree, String(focused), key)) focusKey(key);
  }

  /** Right expands a group, then steps into it. Left collapses a group, then steps out to its parent. */
  function onTreeArrow(e: KeyboardEvent<HTMLElement>, current: Key | null) {
    const node = menuTree && current != null ? menuTree.nodes.get(String(current)) : undefined;
    // With no row highlighted, the search input keeps its caret keys.
    if (!node) return;
    const hasChildren = node.childKeys.length > 0;
    const expanded = hasChildren && isExpanded(node.key);
    if (e.key === "ArrowRight" && hasChildren) {
      e.preventDefault();
      if (expanded) focusKey(state.collection.getKeyAfter(node.key));
      else setTreeExpanded(node.key, true);
    } else if (e.key === "ArrowLeft") {
      if (expanded) {
        e.preventDefault();
        setTreeExpanded(node.key, false);
      } else if (node.parentKey !== undefined) {
        e.preventDefault();
        focusKey(node.parentKey);
      }
    }
  }

  function onMenuKeyDown(e: KeyboardEvent<HTMLElement>) {
    const current = selectionManager.focusedKey;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowLeft":
        if (!hierarchy) onTreeArrow(e, current);
        break;
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
    treeRows
      ? treeRows.findIndex(({ node }) => selectedKeys.has(node.valueKey))
      : filteredOptions.findIndex((o) => selectedKeys.has(valueToKey(getOptionValue(o)))),
  );

  const selectedText =
    !multiple && selectedOptions[0] !== undefined
      ? hierarchy && menuTree
        ? (hierarchyPathLabel(menuTree, valueToKey(getOptionValue(selectedOptions[0])), getOptionLabel) ??
          getOptionLabel(selectedOptions[0]))
        : getOptionLabel(selectedOptions[0])
      : "";
  const hasSelection = menuTree ? selectedKeys.size > 0 : values.length > 0;
  // Multi with a selection shows only the count badge; an empty field shows nothing-selected text, then the placeholder.
  const displayText = selectedText || (hasSelection ? "" : nothingSelectedText || placeholder || "");
  const isPlaceholder = !selectedText && !hasSelection && !nothingSelectedText && !!placeholder;
  const selectedLabels =
    menuTree && tree && getChildren
      ? bucketTreeSelection(selectedOptions, getChildren)[tree.display].map((option) => ({
          key: valueToKey(getOptionValue(option)),
          label: getOptionLabel(option),
        }))
      : multiple
        ? selectedOptions.map((o) => ({ key: valueToKey(getOptionValue(o)), label: getOptionLabel(o) }))
        : [];
  const partialKeys = useMemo(
    () => (menuTree ? partiallySelectedKeys(menuTree, selectedKeys) : undefined),
    [menuTree, selectedKeys],
  );
  const hierarchyRowStates =
    hierarchy && treeRows
      ? new Map(treeRows.map(({ node, level }) => [node.key, { level, hasChildren: node.childKeys.length > 0 }]))
      : undefined;
  const treeRowStates =
    !hierarchy && treeRows
      ? new Map(
          treeRows.map(({ node, level }) => [
            node.key,
            {
              level,
              hasChildren: node.childKeys.length > 0,
              isExpanded: node.childKeys.length > 0 && isExpanded(node.key),
              isIndeterminate: !!partialKeys?.has(node.key),
            },
          ]),
        )
      : undefined;

  function deselect(key: string) {
    if (!multiple || disabledKeys.includes(key)) return;
    proposalProps.onUserEdit?.();
    if (menuTree) {
      const toggledKeys = toggleTreeSelection(menuTree, selectedKeys, key, false, disabledKeySet);
      const toggledOptions = selectedTreeOptions(menuTree, toggledKeys);
      onCommit(toggledOptions.map(getOptionValue), toggledOptions);
      return;
    }
    // Flat multi select. A tree removes the value through `toggleTreeSelection` above.
    const next = values.filter((value) => valueToKey(value) !== key);
    onCommit(
      next,
      next.map((value) => optionsByKey.get(valueToKey(value))).filter((option): option is O => option !== undefined),
    );
  }

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
    selectedLabels,
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
    rowVariant: hierarchyRowStates ? "hierarchy" : treeRowStates ? "tree" : multiple ? "checkbox" : "check",
    tree: treeRowStates ? { rows: treeRowStates, setExpanded: setTreeExpanded } : undefined,
    hierarchy: hierarchyRowStates ? { rows: hierarchyRowStates } : undefined,
    onKeyDown: onMenuKeyDown,
    activeDescendant,
  };

  // Refs stay beside each group. An object that holds a ref is itself a ref, so reading it during render is invalid.
  return {
    triggerRef,
    trigger: triggerProps,
    searchRef,
    search: searchProps,
    listRef,
    menu: menuProps,
    selections: {
      options: selectedLabels.map(({ key, label }) => ({
        key,
        label,
        disabled: disabledKeys.includes(key) ? (disabledReasons[key] ?? true) : false,
      })),
      onDeselect: deselect,
    },
  };
}

/** Labels in option-list order, so a reordered selection still reads as the same value. */
function labelsFor<O, V extends Value>(
  values: readonly V[],
  options: readonly O[],
  getOptionValue: (opt: O) => V,
  getOptionLabel: (opt: O) => string,
): string[] {
  const keys = new Set(values.map(valueToKey));
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const option of options) {
    const key = valueToKey(getOptionValue(option));
    // A tree can list one value under several parents. The proposal names it once.
    if (!keys.has(key) || seen.has(key)) continue;
    seen.add(key);
    labels.push(getOptionLabel(option));
  }
  return labels;
}

/** Labels from the root through the first copy of `valueKey`, joined with ` > `. */
function hierarchyPathLabel<O>(
  tree: MenuTree<O>,
  valueKey: string,
  getOptionLabel: (opt: O) => string,
): string | undefined {
  const node = tree.orderedKeys.map((key) => tree.nodes.get(key)!).find((entry) => entry.valueKey === valueKey);
  if (!node) return undefined;
  const labels: string[] = [];
  let current: MenuTreeNode<O> | undefined = node;
  while (current) {
    labels.unshift(getOptionLabel(current.option));
    current = current.parentKey === undefined ? undefined : tree.nodes.get(current.parentKey);
  }
  return labels.join(" > ");
}

function rootNodes<O>(tree: MenuTree<O>): MenuTreeNode<O>[] {
  return tree.orderedKeys
    .filter((key) => tree.nodes.get(key)!.parentKey === undefined)
    .map((key) => tree.nodes.get(key)!);
}

function childNodes<O>(tree: MenuTree<O>, node: MenuTreeNode<O>): MenuTreeNode<O>[] {
  return node.childKeys.map((key) => tree.nodes.get(key)!);
}

function withKey(keys: ReadonlySet<string>, key: string, include: boolean): ReadonlySet<string> {
  const next = new Set(keys);
  if (include) next.add(key);
  else next.delete(key);
  return next;
}

function isDescendant<O>(tree: MenuTree<O>, key: string, ancestorKey: string): boolean {
  let parentKey = tree.nodes.get(key)?.parentKey;
  while (parentKey !== undefined) {
    if (parentKey === ancestorKey) return true;
    parentKey = tree.nodes.get(parentKey)?.parentKey;
  }
  return false;
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

/** Menus with this many options or fewer omit the search field, unless `onSearch` is set. */
export const searchOptionLimit = 8;

/** Wait before calling `onSearch`, matching the old select field. */
const onSearchDelay = 300;

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
