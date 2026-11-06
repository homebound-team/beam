import type { Node } from "@react-types/shared";
import { useListBoxSection, useSeparator } from "react-aria";
import type { ListState } from "react-stately";
import { Css, Tokens } from "src/Css";
import { persistentItemHeight, sectionSeparatorHeight } from "src/inputs/internal/constants";
import { Option } from "src/inputs/internal/Option";
import { VirtualizedOptions } from "src/inputs/internal/VirtualizedOptions";
import { useTestIds } from "src/utils/useTestIds";

type ListBoxSectionProps<O> = {
  section: Node<O>;
  state: ListState<O>;
  onListHeightChange: (height: number) => void;
  popoverHeight: number;
  scrollOnFocus?: boolean;
  disabledOptionsWithReasons: Record<string, string | undefined>;
};

// Creates a section of options within a ListBox.
// Currently only expects two possible sections; 1. The list of options, and 2. A persistent action (in that order).
export function ListBoxSection<O>(props: ListBoxSectionProps<O>) {
  const { section, state, onListHeightChange, popoverHeight, scrollOnFocus, disabledOptionsWithReasons } = props;
  const tid = useTestIds(props, "listBox");
  const { itemProps, groupProps } = useListBoxSection(section);
  const { separatorProps } = useSeparator({ elementType: "li" });
  const isPersistentSection = section.key !== state.collection.getFirstKey();
  const childNodes = [...section.childNodes];

  return (
    <>
      {isPersistentSection && <li {...separatorProps} css={Css.bt.bc(Tokens.SurfaceSeparator).$} />}
      <li {...itemProps} css={Css.if(!isPersistentSection).oa.$}>
        {/* Styles assume only one Persistent Item is ever shown. Will need to adjust if that ever changes */}
        <ul
          css={
            Css.listReset.if(!isPersistentSection).hPx(popoverHeight - sectionSeparatorHeight - persistentItemHeight).$
          }
          {...groupProps}
        >
          {isPersistentSection ? (
            childNodes.map((item) => (
              <Option
                key={item.key}
                item={item}
                state={state}
                disabledReason={disabledOptionsWithReasons[item.key]}
                {...tid.option}
              />
            ))
          ) : (
            <VirtualizedOptions
              {...tid}
              state={state}
              items={childNodes}
              onListHeightChange={onListHeightChange}
              scrollOnFocus={scrollOnFocus}
              disabledOptionsWithReasons={disabledOptionsWithReasons}
            />
          )}
        </ul>
      </li>
    </>
  );
}
