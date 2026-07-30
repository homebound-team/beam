import { MouseEvent, ReactNode, useMemo } from "react";
import { mergeProps, useFocusRing, useHover, usePress } from "react-aria";
import { maybeTooltip, resolveTooltip } from "src/components";
import { Css, maybeCssVar, Tokens } from "src/Css";
import { SelectCardLayout, SelectCardStoryState, SelectCardView } from "src/inputs/SelectCard/types";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type SelectCardShellProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  tooltip?: ReactNode;
  __storyState?: SelectCardStoryState;
  children: ReactNode;
  /** Optional full-width row pinned to the bottom of the card, below the padded content. */
  footer?: ReactNode;
  view: SelectCardView;
  layout?: SelectCardLayout;
};

/** Tooltip, hover/focus shell, and shared selection-state borders shared by both card variants. */
export function SelectCardShell(props: SelectCardShellProps) {
  const {
    view,
    layout = "vertical",
    label,
    selected: isSelected = false,
    disabled: isDisabled = false,
    tooltip,
    __storyState,
    children,
    footer,
  } = props;

  const { hoverProps, isHovered: isHoveredFromEvents } = useHover({ isDisabled });
  const { isFocusVisible: isFocusVisibleFromEvents, focusProps } = useFocusRing({ within: true });
  const { pressProps, isPressed: isPressedFromEvents } = usePress({ isDisabled });
  const isHovered = __storyState?.hovered ?? isHoveredFromEvents;
  const isFocusVisible = __storyState?.focusVisible ?? isFocusVisibleFromEvents;
  const isPressed = __storyState?.pressed ?? isPressedFromEvents;

  // Flex/padding for the card content lives on an inner div so the footer can span the full card width.
  const contentStyles =
    view === "grid"
      ? layout === "horizontal"
        ? Css.df.fdr.fg1.aic.gap2.p2.$
        : Css.df.fdc.fg1.aic.gap1.px2.py3.tac.$
      : Css.df.fdc.fg1.aifs.gapPx(4).p2.$;

  const styles = useMemo(
    () => ({
      ...Css.df.fdc.ba.br12.bgWhite.bcGray300.w100.$,
      ...(isHovered && !isDisabled && Css.bgGray100.$),
      ...((isSelected || isPressed) &&
        !isDisabled &&
        Css.bcBlue600.bgBlue50.boxShadow(`inset 0 0 0 1px ${maybeCssVar(Tokens.Primary)}`).$),
      ...(isDisabled && (isSelected ? Css.bgGray100.bcGray300.$ : Css.bgGray50.bcGray300.$)),
      ...(isFocusVisible ? Css.bshFocus.$ : {}),
    }),
    [isDisabled, isHovered, isSelected, isFocusVisible, isPressed],
  );

  const tid = useTestIds(props, defaultTestId(label));

  return maybeTooltip({
    title: resolveTooltip(isDisabled, tooltip),
    placement: "top",
    children: (
      <label
        css={{ ...styles, ...Css.cursorPointer.if(isDisabled).cursorNotAllowed.$ }}
        // Keep focus where it is while clicking the card. Without this, mousedown moves focus to
        // the nearest focusable ancestor (e.g. a modal, which has tabindex=-1) before the label
        // click focuses our hidden input. react-aria sees that second focus event with no user
        // event tied to it, assumes "virtual" (screen reader) focus, and shows the keyboard focus
        // ring on a plain mouse click.
        {...mergeProps(hoverProps, focusProps, pressProps, { onMouseDown: (e: MouseEvent) => e.preventDefault() })}
        {...tid}
      >
        <div css={contentStyles}>{children}</div>
        {footer}
      </label>
    ),
  });
}
