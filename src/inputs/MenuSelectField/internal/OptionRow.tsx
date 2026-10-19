import type { Node } from "@react-types/shared";
import { useRef } from "react";
import { mergeProps, useHover, useOption } from "react-aria";
import type { ListState } from "react-stately";
import { Icon } from "src/components/Icon";
import { maybeTooltip } from "src/components/Tooltip";
import { Css, Tokens } from "src/Css";
import { StyledCheckbox } from "src/inputs/CheckboxBase";
import { useTestIds } from "src/utils/useTestIds";

export type OptionRowProps<O> = {
  item: Node<O>;
  state: ListState<O>;
  /** DOM id, referenced by the search input's `aria-activedescendant`. */
  id: string;
  disabledReason?: string;
};

/** Single-select option: label with a trailing check when selected. */
export function SingleOptionRow<O>(props: OptionRowProps<O>) {
  return <BaseOptionRow {...props} variant="check" />;
}

/** Multi-select option: leading checkbox, same look as TreeSelectField rows. */
export function MultiOptionRow<O>(props: OptionRowProps<O>) {
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
  const highlighted = !isDisabled && (isHovered || isFocused);

  return maybeTooltip({
    title: disabledReason,
    placement: "top",
    children: (
      <div
        {...mergeProps(optionProps, hoverProps)}
        // Our own id (stable per index) so the search input can point at it.
        id={id}
        data-key={item.key}
        data-label={item.textValue}
        ref={ref}
        css={{
          ...rowCss,
          ...(highlighted ? Css.bgColor(Tokens.SurfaceRaisedHover).$ : {}),
          ...(isDisabled ? Css.cursorNotAllowed.color(Tokens.TextDisabled).$ : {}),
        }}
        {...tid.option}
      >
        {variant === "checkbox" && <StyledCheckbox isSelected={isSelected} isDisabled={isDisabled} />}
        <span css={Css.truncate.fg1.mw0.$}>{item.rendered}</span>
        {variant === "check" && isSelected && (
          <span css={Css.df.aic.fs0.$}>
            <Icon icon="check" color={isDisabled ? Tokens.TextDisabled : Tokens.SelectionIndicator} />
          </span>
        )}
      </div>
    ),
  });
}

/** Row height in px; virtualized lists rely on it being fixed. */
export const menuRowHeight = 40;

const rowCss = Css.df.aic.gap1.px2.hPx(menuRowHeight).outline0.cursorPointer.sm.color(Tokens.OnSurface).$;
