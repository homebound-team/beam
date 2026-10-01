import type { Node } from "@react-types/shared";
import { useRef } from "react";
import { mergeProps, useHover, useOption } from "react-aria";
import type { ListState } from "react-stately";
import { Icon } from "src/components/Icon";
import { maybeTooltip } from "src/components/Tooltip";
import { Tokens } from "src/Css";
import { StyledCheckbox } from "src/inputs/CheckboxBase";
import { MenuRow } from "src/inputs/internal/menuList/MenuRow";
import { useTestIds } from "src/utils/useTestIds";

export type OptionRowProps<O> = {
  item: Node<O>;
  state: ListState<O>;
  /** DOM id, referenced by the search input's `aria-activedescendant`. */
  id: string;
  disabledReason?: string;
};

/** Single-select option: label with a trailing check when selected. */
export function OptionRow<O>(props: OptionRowProps<O>) {
  return <BaseOptionRow {...props} variant="check" />;
}

/** Multi-select option: leading checkbox, same look as TreeSelectField rows. */
export function CheckboxOptionRow<O>(props: OptionRowProps<O>) {
  return <BaseOptionRow {...props} variant="checkbox" />;
}

function BaseOptionRow<O>(props: OptionRowProps<O> & { variant: "check" | "checkbox" }) {
  const { item, state, id, disabledReason, variant } = props;
  const ref = useRef<HTMLDivElement>(null);
  const tid = useTestIds(props, "option");
  const { hoverProps, isHovered } = useHover({});
  const { optionProps, isDisabled, isFocused, isSelected } = useOption(
    { key: item.key, shouldSelectOnPressUp: true, shouldFocusOnHover: false },
    state,
    ref,
  );

  return maybeTooltip({
    title: disabledReason,
    placement: "top",
    children: (
      <MenuRow
        elementRef={ref}
        elementProps={{
          ...mergeProps(optionProps, hoverProps),
          // Our own id (stable per index) so the search input can point at it.
          id,
          ...({ "data-key": item.key, "data-label": item.textValue } as object),
          ...tid.option,
        }}
        label={item.rendered}
        isFocused={isFocused}
        isHovered={isHovered}
        isDisabled={isDisabled}
        start={variant === "checkbox" ? <StyledCheckbox isSelected={isSelected} isDisabled={isDisabled} /> : undefined}
        end={
          variant === "check" && isSelected ? (
            <Icon icon="check" color={isDisabled ? Tokens.TextDisabled : Tokens.SelectionIndicator} />
          ) : undefined
        }
      />
    ),
  });
}
