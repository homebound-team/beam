import { Node } from "@react-types/shared";
import { useRef } from "react";
import { useHover, useOption } from "react-aria";
import { ListState } from "react-stately";
import { Icon } from "src/components";
import { Css, Palette } from "src/Css";
import { StyledCheckbox } from "src/inputs/CheckboxBase";
import { useTreeSelectFieldProvider } from "src/inputs/TreeSelectField/TreeSelectField";
import { LeveledOption, NestedOption } from "src/inputs/TreeSelectField/utils";
import { Value, valueToKey } from "src/inputs/Value";
import { useTestIds } from "src/utils";

interface TreeOptionProps<O> {
  item: Node<LeveledOption<O>>;
  state: ListState<O>;
  contrast?: boolean;
  allowCollapsing?: boolean;
}
/** Represents a single option within a ListBox - used by SelectField, MultiSelectField, and TreeSelectField */
export function TreeOption<O>(props: TreeOptionProps<O>) {
  const { item, state, contrast = false, allowCollapsing = true } = props;
  const leveledOption = item.value;
  if (!leveledOption) return null;

  const [option, level]: [NestedOption<O>, number] = leveledOption;
  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = useRef<HTMLElement>(null);
  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { hoverProps, isHovered } = useHover({});
  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tid = useTestIds(props, "treeOption");

  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { collapsedKeys, setCollapsedKeys, getOptionValue } = useTreeSelectFieldProvider<O, Value>();

  // TODO: validate this eslint-disable with https://app.shortcut.com/homebound-team/story/40045
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { optionProps, isDisabled, isFocused, isSelected } = useOption(
    { key: item.key, shouldSelectOnPressUp: true, shouldFocusOnHover: false },
    state,
    ref,
  );

  // If this item is not selected, then determine if some of its children are selected to show the indeterminate state.
  // Note: If `isSelected` will be true if all of the children were selected. That auto-parent-selection happens in the `onSelect` callback in TreeSelectField.
  const isIndeterminate = !isSelected && option.children?.some((o) => hasSelectedChildren(o, state, getOptionValue));

  const listItemStyles = {
    item: Css.gray900.if(contrast).white.$,
    hover: Css.bgGray100.if(contrast).bgGray600.$,
    disabled: Css.cursorNotAllowed.gray400.if(contrast).gray500.$,
    focus: Css.add("boxShadow", `inset 0 0 0 1px ${!contrast ? Palette.Blue700 : Palette.Blue500}`).$,
  };

  return (
    <li
      {...hoverProps}
      css={{
        ...Css.df.aic.jcsb.gap1.pl2.mh("42px").outline0.cursorPointer.sm.plPx(16 + level * 8).$,
        ...listItemStyles.item,
        ...(isHovered && !isDisabled ? listItemStyles.hover : {}),
        ...(isFocused ? listItemStyles.focus : {}),
        ...(isDisabled ? listItemStyles.disabled : {}),
      }}
    >
      {allowCollapsing && (
        <span css={Css.wPx(18).fs0.df.aic.$}>
          {option.children && option.children?.length > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCollapsedKeys((prevKeys) =>
                  collapsedKeys.includes(item.key) ? prevKeys.filter((k) => k !== item.key) : [...prevKeys, item.key],
                );
                return false;
              }}
              css={Css.br4.hPx(16).wPx(16).bgTransparent.onHover.bgGray300.$}
              {...tid[`collapseToggle_${item.key}`]}
            >
              <Icon icon={collapsedKeys.includes(item.key) ? "triangleRight" : "triangleDown"} inc={2} />
            </button>
          )}
        </span>
      )}
      <span css={Css.df.aic.gap1.h100.fg1.py1.pr2.$} ref={ref} {...optionProps} data-label={item.textValue}>
        <StyledCheckbox
          isDisabled={isDisabled}
          isSelected={isSelected}
          isIndeterminate={isIndeterminate}
          {...tid[item.key.toString()]}
        />
        <div css={Css.pl1.$}>{item.rendered}</div>
      </span>
    </li>
  );
}

function hasSelectedChildren<O, V extends Value>(
  childOption: NestedOption<O>,
  state: ListState<O>,
  getOptionValue: (o: O) => V,
): boolean {
  if (childOption.children && childOption.children.length > 0) {
    return childOption.children.some((child) => hasSelectedChildren(child, state, getOptionValue));
  }
  return state.selectionManager.isSelected(valueToKey(getOptionValue(childOption)));
}
