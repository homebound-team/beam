import type { ReactNode } from "react";
import { IconButton } from "src/components/IconButton";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type SelectedOptionPillProps = {
  value: ReactNode;
  helperText?: ReactNode;
  onRemove: () => void;
  aiMode?: boolean;
};

/** A selected-option capsule with a remove control. `aiMode` paints the capsule purple. */
export function SelectedOptionPill(props: SelectedOptionPillProps) {
  const { value, helperText, onRemove, aiMode = false } = props;
  const tid = useTestIds(props, "selectedOptionPill");
  return (
    <div css={Css.df.fdc.gap1.w100.$} {...tid}>
      <div
        css={{
          // Setting border-radius to 999px to make it a pill shape.
          ...Css.df.aic.gap2.w100.plPx(20).pr2.py1.borderRadius("999px").ba.bcGray300.$,
          ...(aiMode ? Css.aiBackground.color(Palette.Purple800).$ : Css.bgWhite.color(Tokens.OnSurface).$),
        }}
      >
        <div css={Css.fg1.wbba.sm.$} {...tid.value}>
          {value}
        </div>
        <IconButton icon="x" compact label="Remove" onClick={onRemove} {...tid.remove} />
      </div>
      {helperText && (
        <div css={Css.plPx(20).xs.$} {...tid.helperText}>
          {helperText}
        </div>
      )}
    </div>
  );
}
