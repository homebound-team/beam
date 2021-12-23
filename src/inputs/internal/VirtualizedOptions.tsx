import { Node } from "@react-types/shared";
import React, { useEffect, useRef } from "react";
import { SelectState } from "react-stately";
import { Virtuoso } from "react-virtuoso";
import { VirtuosoHandle } from "react-virtuoso/dist/components";
import { Css, Palette } from "src/Css";
import { Option } from "src/inputs/internal/Option";

interface VirtualizedOptionsProps<O> {
  state: SelectState<O>;
  items: Node<O>[];
  onListHeightChange: (height: number) => void;
  contrast: boolean;
  // Whether we should auto-scroll to the item in focus. Should only be used when Options are using "virtual focus". Should not be used if focus is triggered on clicking an element.
  scrollOnFocus?: boolean;
  // Adds 'Loading' footer to the list
  loading?: boolean | (() => JSX.Element);
}

// Displays ListBox options in a virtualized container for performance reasons
export function VirtualizedOptions<O>(props: VirtualizedOptionsProps<O>) {
  const { state, items, onListHeightChange, contrast, scrollOnFocus, loading } = props;
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
      // Ensure the selected item is visible when the list renders
      initialTopMostItemIndex={selectedItem ? selectedItem.index : 0}
      // We don't really need to set this, but it's handy for tests, which would
      // otherwise render just 1 row. A better way to do this would be to jest.mock
      // out Virtuoso with an impl that just rendered everything, but doing this for now.
      initialItemCount={5}
      itemContent={(idx) => {
        const item = items[idx];
        if (item) {
          return (
            <Option
              key={item.key}
              item={item}
              state={state}
              contrast={contrast}
              // Only send scrollToIndex functionality forward if we are not auto-scrolling on focus.
              scrollToIndex={scrollOnFocus ? undefined : virtuosoRef.current?.scrollToIndex}
            />
          );
        }
      }}
      components={
        !loading
          ? {}
          : {
              Footer:
                typeof loading === "function"
                  ? loading
                  : () => {
                      const circleCss = Css.hPx(8)
                        .wPx(8)
                        .br4.bgColor(contrast ? Palette.Gray500 : Palette.Gray300)
                        .add("animationName", contrast ? "loadingDotsContrast" : "loadingDots")
                        .add("animationDuration", "800ms")
                        .add("animationIterationCount", "infinite")
                        .add("animationTimingFunction", "linear")
                        .add("animationDirection", "alternate").$;
                      return (
                        <div css={Css.py2.df.jcc.$}>
                          <div
                            aria-label="Loading"
                            css={{
                              ...circleCss,
                              ...Css.relative
                                .add("animationDelay", "300ms")

                                .addIn("&:before, &:after", {
                                  ...circleCss,
                                  ...Css.add("content", "' '").absolute.dib.$,
                                })
                                .addIn("&:before", Css.leftPx(-12).add("animationDelay", "0").$)
                                .addIn("&:after", Css.rightPx(-12).add("animationDelay", "600ms").$).$,
                            }}
                          />
                        </div>
                      );
                    },
            }
      }
    />
  );
}
