import type { ReactNode } from "react";
import { useHover } from "react-aria";
import { CountBadge } from "src/components/CountBadge";
import { Icon } from "src/components/Icon";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type SelectionSummaryPillProps = {
  text: string;
  onClick: () => void;
  /** If a ReactNode, that reason is shown in a tooltip. */
  disabled?: boolean | ReactNode;
  /** Shows just this count and an × instead of the text, e.g. on small screens. `text` stays the accessible name. */
  compactCount?: number;
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: { hovered?: boolean };
};

/** Summarizes a group of selections, e.g. "3 Rows Selected". The whole pill is the button that clears them. */
export function SelectionSummaryPill(props: SelectionSummaryPillProps) {
  const { text, onClick, disabled = false, compactCount, __storyState } = props;
  const tid = useTestIds(props, "selectionSummaryPill");
  const { hoverProps, isHovered: isHoveredFromEvents } = useHover({ isDisabled: !!disabled });
  const isHovered = __storyState?.hovered ?? isHoveredFromEvents;

  return maybeTooltip({
    title: resolveTooltip(disabled),
    placement: "top",
    children: (
      <button
        type="button"
        disabled={!!disabled}
        onClick={onClick}
        aria-label={`Clear ${text}`}
        css={pillStyles(!!disabled, isHovered, compactCount !== undefined)}
        {...hoverProps}
        {...tid}
      >
        {compactCount !== undefined ? (
          <>
            <CountBadge count={compactCount} bgColor={disabled ? Palette.Gray400 : Palette.Blue600} {...tid.count} />
            <span css={Css.df.fs0.$} {...tid.clear}>
              <Icon icon="x" color={disabled ? Tokens.OnSurfaceActiveDisabled : Palette.Gray900} />
            </span>
          </>
        ) : (
          <>
            {text}
            <span css={Css.color(disabled ? Tokens.OnSurfaceActiveDisabled : Tokens.OnSurfaceActive).$} {...tid.clear}>
              Clear
            </span>
          </>
        )}
      </button>
    ),
  });
}

/** Figma draws the border inside the box, so the padding gives up 1px to it. */
function pillStyles(disabled: boolean, hovered: boolean, compact: boolean) {
  // Compact matches the 40px icon buttons beside it in a small-screen toolbar; Figma trims the right side for the ×'s inset
  return Css.smSb.dif.aic.gap1.wsnw.ba.brPill
    .plPx(compact ? 19 : 15)
    .prPx(15)
    .pyPx(7)
    .bc(Tokens.SurfaceActiveBorder)
    .color(disabled ? Tokens.OnSurfaceActiveDisabled : Palette.Gray900)
    .bgColor(hovered ? Tokens.SurfaceActiveHover : Tokens.SurfaceActive)
    .if(disabled).cursorNotAllowed.$;
}
