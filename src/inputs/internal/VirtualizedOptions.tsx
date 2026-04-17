import { getInteractionModality } from "@react-aria/interactions";
import { Node } from "@react-types/shared";
import { useEffect, useRef } from "react";
import { ListState } from "react-stately";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { LoadingDots } from "src/inputs/internal/LoadingDots";
import { Option } from "src/inputs/internal/Option";
import { TreeOption } from "src/inputs/TreeSelectField/TreeOption";
import { isLeveledNode, LeveledOption } from "src/inputs/TreeSelectField/utils";

type VirtualizedOptionsProps<O> = {
  state: ListState<O>;
  items: Node<O>[] | Node<LeveledOption<O>>[];
  onListHeightChange: (height: number) => void;
  contrast: boolean;
  // Whether we should auto-scroll to the item in focus. Should only be used when Options are using "virtual focus". Should not be used if focus is triggered on clicking an element.
  scrollOnFocus?: boolean;
  // Adds 'Loading' footer to the list
  loading?: boolean | (() => JSX.Element);
  disabledOptionsWithReasons: Record<string, string | undefined>;
  isTree?: boolean;
  allowCollapsing?: boolean;
};

// Displays ListBox options in a virtualized container for performance reasons
export function VirtualizedOptions<O>(props: VirtualizedOptionsProps<O>) {
  const {
    state,
    items,
    onListHeightChange,
    contrast,
    scrollOnFocus,
    loading,
    disabledOptionsWithReasons,
    isTree,
    allowCollapsing,
  } = props;
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const focusedKey = state.selectionManager.focusedKey;
  const focusedItem = focusedKey != null ? state.collection.getItem(focusedKey) : null;
  const selectedItem =
    state.selectionManager.selectedKeys.size > 0
      ? state.collection.getItem([...state.selectionManager.selectedKeys.values()][0])
      : undefined;

  // Handle scrolling to the item in focus when navigating options via Keyboard - this should only be applied when using a "virtual focus", such as a ComboBox where the browser's focus remains in the <input /> element.
  // Only scroll for keyboard-initiated focus changes. Scrolling on pointer/mouse focus changes
  // causes Virtuoso to recycle DOM nodes mid-press, which breaks React Aria's usePress lifecycle
  // (the pointerup event is lost, so onPress/onSelect never fires).
  useEffect(
    () => {
      if (!!scrollOnFocus && getInteractionModality() === "keyboard" && virtuosoRef.current && focusedItem?.index) {
        virtuosoRef.current.scrollToIndex({ index: focusedItem.index, align: "center" });
      }
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedItem],
  );

  return (
    <Virtuoso
      ref={virtuosoRef}
      totalListHeightChanged={onListHeightChange}
      totalCount={items.length}
      {...(process.env.NODE_ENV === "test"
        ? {
            // In tests, we render all rows so assertions can see expands/async-loaded items. However,
            // the `initialItemCount` (next prop) is only applied on amount, so we set `key={items.length}`
            // to force a remount when our list changes -- and we only want/need this in tests, b/c otherwise
            // in production a Virtuoso remount causes visible flashing.
            key: items.length,
            // We don't really need to set this, but it's handy for tests, which would otherwise render
            // just 1 row. A better way to do this would be to jest.mock out Virtuoso with an impl that
            // just rendered everything, but doing this for now.
            initialItemCount: items.length,
          }
        : {
            // Ensure the selected item is visible when the list renders
            // This seems to break tests, so only add in the non-test environment.
            initialTopMostItemIndex: selectedItem ? selectedItem.index : 0,
          })}
      itemContent={(idx) => {
        const item = items[idx];
        if (item) {
          if (isTree && isLeveledNode(item)) {
            return (
              <TreeOption
                key={item.key}
                item={item}
                state={state}
                contrast={contrast}
                // scrollToIndex={scrollOnFocus ? undefined : virtuosoRef.current?.scrollToIndex}
                allowCollapsing={allowCollapsing}
              />
            );
          }
          if (!isLeveledNode(item)) {
            return (
              <Option
                key={item.key}
                item={item}
                state={state}
                contrast={contrast}
                // Only send scrollToIndex functionality forward if we are not auto-scrolling on focus.
                scrollToIndex={scrollOnFocus ? undefined : virtuosoRef.current?.scrollToIndex}
                disabledReason={disabledOptionsWithReasons[item.key]}
              />
            );
          }
        }
      }}
      components={
        !loading
          ? {}
          : {
              Footer: typeof loading === "function" ? loading : () => <LoadingDots contrast={contrast} />,
            }
      }
    />
  );
}
