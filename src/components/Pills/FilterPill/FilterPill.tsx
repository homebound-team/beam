import type { ReactNode } from "react";
import { Icon } from "src/components/Icon";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type FilterPillProps = {
  text: string;
  onClick: () => void;
  /** If a ReactNode, that reason is shown in a tooltip. */
  disabled?: boolean | ReactNode;
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: { hovered?: boolean };
};

/** Dismissible pill. The whole control is the button, including the close icon. */
export function FilterPill(props: FilterPillProps) {
  const { text, onClick, disabled = false, __storyState } = props;
  const tid = useTestIds(props, "filterPill");
  const isDisabled = !!disabled;
  const ink = isDisabled ? Palette.Gray600 : Palette.Black;
  const reason = resolveTooltip(disabled);

  // Disabled buttons don't fire pointer events, and the tooltip trigger has no box, so this wrapper catches the hover.
  return maybeTooltip({
    title: reason,
    placement: "top",
    children: (
      <span css={reason ? Css.dif.cursorNotAllowed.$ : Css.display("contents").$}>
        <button
          type="button"
          disabled={isDisabled}
          onClick={onClick}
          css={pillStyles(isDisabled, !!__storyState?.hovered)}
          {...tid}
        >
          <span css={Css.tal.lineClamp1.wbba.$} title={text}>
            {text}
          </span>
          <span css={Css.fs0.$} {...tid.x}>
            <Icon icon="x" color={ink} inc={2} />
          </span>
        </button>
      </span>
    ),
  });
}

/** A disabled button can still match :hover, so the hover fill is skipped when disabled. */
function pillStyles(disabled: boolean, hovered: boolean) {
  return Css.xsSb.dif.aic.br16.px1
    .gapPx(4)
    .pyPx(4)
    .mhPx(24)
    .color(disabled ? Palette.Gray600 : Palette.Black)
    .bgColor(hovered && !disabled ? Tokens.SurfaceActiveHover : Tokens.SurfaceActive)
    .if(!disabled)
    .onHover.bgColor(Tokens.SurfaceActiveHover)
    .if(disabled).cursorNotAllowed.$;
}
