import { getInteractionModality } from "@react-aria/interactions";
import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from "react";
import { useListBox } from "react-aria";
import type { ListState } from "react-stately";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { Css, Tokens } from "src/Css";
import { LoadingDots } from "src/inputs/internal/LoadingDots";
import {
  menuRowHeight,
  MultiOptionRow,
  SingleOptionRow,
  TreeOptionRow,
  type TreeRowState,
} from "src/inputs/MenuSelectField/internal/OptionRow";
import type { MenuOptionItem } from "src/inputs/MenuSelectField/types";
import { useTestIds } from "src/utils/useTestIds";

/** The open menu: its list, and the overlay open state around it. */
export type MenuSelectMenu<O> = {
  isOpen: boolean;
  close: (opts: { restoreFocus: boolean }) => void;
  /** DOM id of the listbox; the trigger and search input point at it. */
  listId: string;
  state: ListState<MenuOptionItem<O>>;
  /** Shows a loading row while a lazy option list is in flight. */
  loading: boolean;
  disabledReasons: Record<string, string | undefined>;
  /** Row scrolled into view on mount, e.g. the first selected option. */
  initialIndex: number;
  /** `"check"` draws a trailing check for one value. `"checkbox"` draws a leading checkbox when several can be toggled. `"tree"` adds depth and expansion. */
  rowVariant: "check" | "checkbox" | "tree";
  /** Tree state for each visible row, keyed by option key. Only set for `"tree"`. */
  tree?: { rows: Map<string, TreeRowState>; setExpanded: (key: string, expanded: boolean) => void };
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  /** DOM id of the option that has virtual focus. */
  activeDescendant?: string;
};

export type OptionListProps<O> = {
  menu: MenuSelectMenu<O>;
  listRef: RefObject<HTMLDivElement | null>;
  label: string;
  /** Keyboard handler when this list holds focus. Omitted when the search input does. */
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  /** Option id for `aria-activedescendant` when this listbox holds keyboard focus. */
  activeDescendant?: string;
};

/** Virtualized listbox with virtual focus. DOM focus stays on the search field, or on this list when there is no search. */
export function OptionList<O>(props: OptionListProps<O>) {
  const { menu, listRef, label, onKeyDown, activeDescendant } = props;
  const { state, listId: id, disabledReasons, initialIndex, loading, rowVariant, tree } = menu;
  const tid = useTestIds(props, "optionList");
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  // Labels wrap, so rows vary in height. Size the list to what Virtuoso measured.
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>();
  const { listBoxProps } = useListBox(
    {
      id,
      "aria-label": label,
      autoFocus: false,
      shouldUseVirtualFocus: true,
      shouldFocusOnHover: false,
      shouldSelectOnPressUp: true,
      isVirtualized: true,
    },
    state,
    listRef,
  );
  const items = [...state.collection];
  const focusedKey = state.selectionManager.focusedKey;

  // Only follow keyboard focus; scrolling on pointer focus recycles rows mid-press and drops the click.
  useEffect(() => {
    if (focusedKey == null || getInteractionModality() !== "keyboard") return;
    const index = state.collection.getItem(focusedKey)?.index;
    if (index !== undefined) virtuosoRef.current?.scrollIntoView({ index, behavior: "auto" });
  }, [focusedKey, state.collection]);

  // Rows are rendered synchronously for the first paint; otherwise the panel paints empty until Virtuoso
  // measures. A scrolled list starts at Virtuoso's initial index: `index * menuRowHeight` lands mid-row once a label wraps.
  const [initialTop] = useState(() => Math.max(0, Math.min(initialIndex, items.length - 1)));

  const Row = rowVariant === "checkbox" ? MultiOptionRow : SingleOptionRow;
  const isTree = rowVariant === "tree" && tree !== undefined;
  // Tests render every row (jsdom has no layout); remount when the count changes so filtering is reflected.
  const isTest = process.env.NODE_ENV === "test";

  return (
    <div
      {...listBoxProps}
      {...(onKeyDown ? { onKeyDown, tabIndex: -1, "aria-activedescendant": activeDescendant } : {})}
      ref={listRef}
      css={Css.df.fdc.fg1.mh0.outline0.$}
      {...tid.listbox}
    >
      {items.length === 0 && !loading ? (
        <div role="presentation" css={emptyCss} {...tid.empty}>
          No results
        </div>
      ) : (
        <>
          {items.length > 0 && (
            <Virtuoso
              key={isTest ? items.length : "virtuoso"}
              ref={virtuosoRef}
              style={{
                height: measuredHeight ?? items.length * menuRowHeight,
                flexShrink: 1,
                minHeight: 0,
                overscrollBehavior: "contain",
              }}
              totalCount={items.length}
              defaultItemHeight={menuRowHeight}
              totalListHeightChanged={setMeasuredHeight}
              computeItemKey={(index) => String(items[index]?.key ?? index)}
              {...(isTest
                ? { initialItemCount: items.length }
                : initialTop === 0
                  ? { initialItemCount: Math.min(items.length, initialRenderCount) }
                  : { initialTopMostItemIndex: initialTop })}
              itemContent={(index) => {
                const item = items[index];
                const entry = item?.value;
                if (!item || !entry) return null;
                const treeRow = isTree ? tree?.rows.get(String(item.key)) : undefined;
                if (treeRow && tree) {
                  return (
                    <TreeOptionRow
                      item={item}
                      state={state}
                      id={optionDomId(id, index)}
                      disabledReason={disabledReasons[entry.valueKey]}
                      row={treeRow}
                      onExpandedChange={(expanded) => tree.setExpanded(String(item.key), expanded)}
                      {...tid}
                    />
                  );
                }
                return (
                  <Row
                    item={item}
                    state={state}
                    id={optionDomId(id, index)}
                    disabledReason={disabledReasons[entry.valueKey]}
                    {...tid}
                  />
                );
              }}
            />
          )}
          {loading && <LoadingDots />}
        </>
      )}
    </div>
  );
}

/** DOM id of the option at `index` in listbox `listId`. */
export function optionDomId(listId: string, index: number): string {
  return `${listId}-option-${index}`;
}

// Enough rows to fill the tallest anchored panel (512px / 40px).
const initialRenderCount = 13;

const emptyCss = Css.df.aic.px2.hPx(menuRowHeight).sm.color(Tokens.OnSurfaceMuted).$;
