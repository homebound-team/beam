import type { ReactNode } from "react";
import { IconButton } from "src/components/IconButton";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type SelectedOptionPillProps = {
  value: ReactNode;
  helperText?: ReactNode;
  onRemove: () => void;
  aiMode?: boolean;
  /** Hides the remove control so the selection cannot be cleared. */
  disabled?: boolean;
};

/** A selected-option capsule with a remove control. `aiMode` paints the capsule purple. */
export function SelectedOptionPill(props: SelectedOptionPillProps) {
  const { value, helperText, onRemove, aiMode = false, disabled = false } = props;
  const tid = useTestIds(props, "selectedOptionPill");
  return (
    <div css={Css.df.fdc.gap1.w100.$} {...tid}>
      <div
        css={{
          ...Css.df.aifs.gap2.w100.plPx(20).pr2.py1.brPill.ba.bcGray300.$,
          ...(aiMode ? Css.aiBackground.color(Palette.Purple800).$ : Css.bgWhite.color(Tokens.OnSurface).$),
        }}
      >
        <div css={Css.fg1.mw0.sm.lineClamp2.$} {...tid.value}>
          {value}
        </div>
        {!disabled && (
          // Matching height of the close button with line-height of the text.
          // This allows the button to be vertically centered with the first line of text.
          <span css={Css.df.aic.hPx(20).fs0.$}>
            <IconButton icon="x" compact label="Remove" onClick={onRemove} {...tid.remove} />
          </span>
        )}
      </div>
      {helperText && (
        <div css={Css.plPx(20).xs.$} {...tid.helperText}>
          {helperText}
        </div>
      )}
    </div>
  );
}
