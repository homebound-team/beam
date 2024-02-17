import { Node } from "@react-types/shared";
import { useRef } from "react";
import { mergeProps, useHover, useOption } from "react-aria";
import { ListState, TreeState } from "react-stately";
import { maybeTooltip } from "src/components";
import { Icon } from "src/components/Icon";
import { Css, Palette } from "src/Css";
import { isPersistentKey } from "src/inputs/ChipSelectField";

interface OptionProps<O> {
  item: Node<O>;
  state: ListState<O> | TreeState<O>;
  contrast?: boolean;
  scrollToIndex?: (index: number) => void;
  disabledReason?: string;
}
/** Represents a single option within a ListBox - used by SelectField and MultiSelectField */
export function Option<O>(props: OptionProps<O>) {
  const { item, state, contrast = false, scrollToIndex, disabledReason } = props;
  const ref = useRef<HTMLLIElement>(null);
  const { hoverProps, isHovered } = useHover({});

  const themeStyles = {
    item: Css.gray900.if(contrast).white.$,
    hover: Css.bgGray100.if(contrast).bgGray600.$,
    disabled: Css.cursorNotAllowed.gray400.if(contrast).gray500.$,
    focus: Css.add("boxShadow", `inset 0 0 0 1px ${!contrast ? Palette.Blue700 : Palette.Blue500}`).$,
  };

  // Get props for the option element.
  // Prevent options from receiving browser focus via shouldUseVirtualFocus.
  const { optionProps, isDisabled, isFocused, isSelected } = useOption(
    { key: item.key, shouldSelectOnPressUp: true, shouldFocusOnHover: false },
    state,
    ref,
  );

  return maybeTooltip({
    title: disabledReason,
    placement: "right",
    children: (
      <li
        {...mergeProps(optionProps, hoverProps)}
        data-label={item.textValue}
        ref={ref as any}
        css={{
          ...Css.df.aic.jcsb.py1.px2.mh("42px").outline0.cursorPointer.sm.$,
          // Assumes only one Persistent Item per list - will need to change to utilize Sections if that assumption is incorrect.
          ...(isPersistentKey(item.key) ? Css.bt.bGray200.$ : {}),
          ...themeStyles.item,
          ...(isHovered && !isDisabled ? themeStyles.hover : {}),
          ...(isFocused ? themeStyles.focus : {}),
          ...(isDisabled ? themeStyles.disabled : {}),
        }}
      >
        {item.rendered}
        {isSelected && (
          <span css={Css.fs0.$}>
            <Icon
              icon="check"
              color={
                !contrast
                  ? isDisabled
                    ? Palette.Gray400
                    : Palette.Blue700
                  : isDisabled
                  ? Palette.Gray500
                  : Palette.White
              }
            />
          </span>
        )}
      </li>
    ),
  });
}
