import { ReactNode, useMemo } from "react";
import { mergeProps, useFocusRing, useHover, usePress } from "react-aria";
import { maybeTooltip, resolveTooltip } from "src/components";
import { Css, maybeCssVar, Tokens } from "src/Css";
import { SelectCardStoryState, SelectCardView } from "src/inputs/SelectCard/types";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type SelectCardShellProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  tooltip?: ReactNode;
  __storyState?: SelectCardStoryState;
  children: ReactNode;
  view: SelectCardView;
};

/** Tooltip, hover/focus shell, and shared selection-state borders shared by both card variants. */
export function SelectCardShell(props: SelectCardShellProps) {
  const {
    view,
    label,
    selected: isSelected = false,
    disabled: isDisabled = false,
    tooltip,
    __storyState,
    children,
  } = props;

  const { hoverProps, isHovered: isHoveredFromEvents } = useHover({ isDisabled });
  const { isFocusVisible: isFocusVisibleFromEvents, focusProps } = useFocusRing({ within: true });
  const { pressProps, isPressed: isPressedFromEvents } = usePress({ isDisabled });
  const isHovered = __storyState?.hovered ?? isHoveredFromEvents;
  const isFocusVisible = __storyState?.focusVisible ?? isFocusVisibleFromEvents;
  const isPressed = __storyState?.pressed ?? isPressedFromEvents;

  const styles = useMemo(
    () => ({
      ...Css.df.fdc.ba.br12.bgWhite.bcGray300.w100.$,
      ...(view === "grid" ? Css.aic.gap1.px2.py3.tac.$ : Css.aifs.gapPx(4).p2.$),
      ...(isHovered && !isDisabled && Css.bgGray100.$),
      ...((isSelected || isPressed) &&
        !isDisabled &&
        Css.bcBlue600.bgBlue50.boxShadow(`inset 0 0 0 1px ${maybeCssVar(Tokens.Primary)}`).$),
      ...(isDisabled && (isSelected ? Css.bgGray100.bcGray300.$ : Css.bgGray50.bcGray300.$)),
      ...(isFocusVisible ? Css.bshFocus.$ : {}),
    }),
    [view, isDisabled, isHovered, isSelected, isFocusVisible, isPressed],
  );

  const tid = useTestIds(props, defaultTestId(label));

  return maybeTooltip({
    title: resolveTooltip(isDisabled, tooltip),
    placement: "top",
    children: (
      <label
        css={{ ...styles, ...Css.cursorPointer.if(isDisabled).cursorNotAllowed.$ }}
        {...mergeProps(hoverProps, focusProps, pressProps)}
        {...tid}
      >
        {children}
      </label>
    ),
  });
}
