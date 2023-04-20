import { Node } from "@react-types/shared";
import { useEffect, useRef } from "react";
import { SelectState } from "react-stately";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { LoadingDots } from "src/inputs/internal/LoadingDots";
import { Option } from "src/inputs/internal/Option";
import { TreeOption } from "src/inputs/TreeSelectField/TreeOption";
import { isLeveledNode, LeveledOption } from "src/inputs/TreeSelectField/utils";

interface VirtualizedOptionsProps<O> {
  state: SelectState<O>;
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
}

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
  const focusedItem = state.collection.getItem(state.selectionManager.focusedKey);
  const selectedItem =
    state.selectionManager.selectedKeys.size > 0
      ? state.collection.getItem([...state.selectionManager.selectedKeys.values()][0])
      : undefined;

  // Handle scrolling to the item in focus when navigating options via Keyboard - this should only be applied when using a "virtual focus", such as a ComboBox where the browser's focus remains in the <input /> element.
  useEffect(() => {
    if (scrollOnFocus && virtuosoRef.current && focusedItem?.index) {
      virtuosoRef.current.scrollToIndex({ index: focusedItem.index, align: "center" });
    }
  }, [focusedItem]);

  return (
    <Virtuoso
      ref={virtuosoRef}
      totalListHeightChanged={onListHeightChange}
      totalCount={items.length}
      {...(process.env.NODE_ENV === "test"
        ? {
            initialItemCount: items.length,
            key: items.length,
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
