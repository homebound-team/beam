import type { ReactNode } from "react";
import { DisabledTooltip } from "src/components/Pills/DisabledTooltip";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type SelectionSummaryPillProps = {
  text: string;
  onClick: () => void;
  /** If a ReactNode, that reason is shown in a tooltip. */
  disabled?: boolean | ReactNode;
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: { hovered?: boolean };
};

/** Summarizes a group of selections, e.g. "3 Rows Selected". The whole pill is the button that clears them. */
export function SelectionSummaryPill(props: SelectionSummaryPillProps) {
  const { text, onClick, disabled = false, __storyState } = props;
  const tid = useTestIds(props, "selectionSummaryPill");
  const isDisabled = !!disabled;

  return (
    <DisabledTooltip disabled={disabled}>
      <button
        type="button"
        disabled={isDisabled}
        onClick={onClick}
        aria-label={`Clear ${text}`}
        css={pillStyles(isDisabled, !!__storyState?.hovered)}
        {...tid}
      >
        {text}
        <span css={Css.color(isDisabled ? Palette.Gray600 : Tokens.OnSurfaceActive).$} {...tid.clear}>
          Clear
        </span>
      </button>
    </DisabledTooltip>
  );
}

/** Figma draws the border inside the box, so the padding gives up 1px to it. */
function pillStyles(disabled: boolean, hovered: boolean) {
  return Css.smSb.dif.aic.gap1.wsnw.ba.bcBlue200
    .borderRadius("999px")
    .pxPx(15)
    .pyPx(7)
    .color(disabled ? Palette.Gray600 : Palette.Black)
    .bgColor(hovered && !disabled ? Tokens.SurfaceActiveHover : Palette.Blue50)
    .if(!disabled)
    .onHover.bgColor(Tokens.SurfaceActiveHover)
    .if(disabled).cursorNotAllowed.$;
}
