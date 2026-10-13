import type { HTMLAttributes, ReactNode, Ref } from "react";
import { Css, Tokens } from "src/Css";

export type MenuRowProps = {
  label: ReactNode;
  /** Leading slot, e.g. a checkbox or icon. */
  start?: ReactNode;
  /** Trailing slot, e.g. the selected check. */
  end?: ReactNode;
  isFocused?: boolean;
  isHovered?: boolean;
  isDisabled?: boolean;
  elementProps?: HTMLAttributes<HTMLDivElement>;
  elementRef?: Ref<HTMLDivElement>;
};

/** Pure visual row shared by listbox options and menu items. */
export function MenuRow(props: MenuRowProps) {
  const { label, start, end, isFocused, isHovered, isDisabled, elementProps, elementRef } = props;
  const highlighted = !isDisabled && (isHovered || isFocused);
  return (
    <div
      {...elementProps}
      ref={elementRef}
      css={{
        ...rowCss,
        ...(highlighted ? Css.bgColor(Tokens.SurfaceRaisedHover).$ : {}),
        ...(isDisabled ? Css.cursorNotAllowed.color(Tokens.TextDisabled).$ : {}),
      }}
    >
      {start && <span css={Css.df.aic.fs0.$}>{start}</span>}
      <span css={Css.truncate.fg1.mw0.$}>{label}</span>
      {end && <span css={Css.df.aic.fs0.$}>{end}</span>}
    </div>
  );
}

/** Row height in px; virtualized lists rely on it being fixed. */
export const menuRowHeight = 40;

const rowCss = Css.df.aic.gap1.px2.hPx(menuRowHeight).outline0.cursorPointer.sm.color(Tokens.OnSurface).$;
