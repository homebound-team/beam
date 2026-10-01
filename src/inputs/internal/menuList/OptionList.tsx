import { getInteractionModality } from "@react-aria/interactions";
import type { Node } from "@react-types/shared";
import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useListBox } from "react-aria";
import type { ListState } from "react-stately";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { Css, Tokens } from "src/Css";
import { LoadingDots } from "src/inputs/internal/LoadingDots";
import { menuRowHeight } from "src/inputs/internal/menuList/MenuRow";
import { CheckboxOptionRow, OptionRow } from "src/inputs/internal/menuList/OptionRow";
import { useTestIds } from "src/utils/useTestIds";

export type OptionListProps<O> = {
  state: ListState<O>;
  listRef: RefObject<HTMLDivElement | null>;
  /** DOM id of the listbox; the trigger and search input point at it. */
  id: string;
  label: string;
  variant: "check" | "checkbox";
  disabledReasons: Record<string, string | undefined>;
  /** Row scrolled into view on mount, e.g. the first selected option. */
  initialIndex?: number;
  /** Shows a loading row while a lazy option list is in flight. */
  loading?: boolean;
  emptyText?: string;
};

/** Virtualized listbox with virtual focus; DOM focus stays in the menu's search input. */
export function OptionList<O>(props: OptionListProps<O>) {
  const {
    state,
    listRef,
    id,
    label,
    variant,
    disabledReasons,
    initialIndex = 0,
    loading = false,
    emptyText = "No results",
  } = props;
  const tid = useTestIds(props, "optionList");
  const virtuosoRef = useRef<VirtuosoHandle>(null);
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
  const items = [...state.collection] as Node<O>[];
  const focusedKey = state.selectionManager.focusedKey;

  // Only follow keyboard focus; scrolling on pointer focus recycles rows mid-press and drops the click.
  useEffect(() => {
    if (focusedKey == null || getInteractionModality() !== "keyboard") return;
    const index = state.collection.getItem(focusedKey)?.index;
    if (index !== undefined) virtuosoRef.current?.scrollIntoView({ index, behavior: "auto" });
  }, [focusedKey, state.collection]);

  // Rows are rendered synchronously for the first paint; otherwise the panel paints empty (or at the wrong
  // offset) until Virtuoso measures. Deep targets in long lists use Virtuoso's initial index, which paints
  // blank for a few frames but never the wrong rows.
  const [{ initialTop, initialCount }] = useState(() => ({
    initialTop: Math.max(0, Math.min(initialIndex, items.length - 1)),
    initialCount: items.length,
  }));
  const syncScroll = initialTop + initialRenderCount <= maxSyncRenderCount;
  useLayoutEffect(() => {
    // Virtuoso's root is the scroller; its `scrollerRef` callback fires too late for the first paint.
    const scroller = listRef.current?.firstElementChild;
    if (!syncScroll || !scroller) return;
    // Clamp ourselves; Virtuoso's first-pass content height is inflated, so the browser won't.
    const maxTop = Math.max(0, initialCount * menuRowHeight - scroller.clientHeight);
    setScrollTop(scroller, Math.min(initialTop * menuRowHeight, maxTop));
  }, [listRef, syncScroll, initialTop, initialCount]);

  const Row = variant === "checkbox" ? CheckboxOptionRow : OptionRow;
  // Tests render every row (jsdom has no layout); remount when the count changes so filtering is reflected.
  const isTest = process.env.NODE_ENV === "test";

  return (
    <div {...listBoxProps} ref={listRef} css={Css.df.fdc.fg1.mh0.outline0.$} {...tid.listbox}>
      {items.length === 0 && !loading ? (
        <div role="presentation" css={emptyCss} {...tid.empty}>
          {emptyText}
        </div>
      ) : (
        <>
          {items.length > 0 && (
            <Virtuoso
              key={isTest ? items.length : "virtuoso"}
              ref={virtuosoRef}
              style={{
                height: items.length * menuRowHeight,
                flexShrink: 1,
                minHeight: 0,
                overscrollBehavior: "contain",
              }}
              totalCount={items.length}
              fixedItemHeight={menuRowHeight}
              computeItemKey={(index) => String(items[index]?.key ?? index)}
              {...(isTest
                ? { initialItemCount: items.length }
                : syncScroll
                  ? { initialItemCount: Math.min(items.length, initialTop + initialRenderCount) }
                  : { initialTopMostItemIndex: initialTop })}
              itemContent={(index) => {
                const item = items[index];
                if (!item) return null;
                return (
                  <Row
                    item={item}
                    state={state}
                    id={optionDomId(id, index)}
                    disabledReason={disabledReasons[String(item.key)]}
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

function setScrollTop(el: Element, top: number): void {
  el.scrollTop = top;
}

// Enough rows to fill the tallest anchored panel (512px / 40px).
const initialRenderCount = 13;
const maxSyncRenderCount = 60;

const emptyCss = Css.df.aic.px2.hPx(menuRowHeight).sm.color(Tokens.OnSurfaceMuted).$;
