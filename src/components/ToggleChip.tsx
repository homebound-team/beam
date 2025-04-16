import { Icon, IconKey } from "src/components/Icon";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Margin, Only, Palette, Xss } from "src/Css";
import { useHover } from "src/hooks";
import { useTestIds } from "src/utils/useTestIds";
import { chipBaseStyles } from "./Chip";

type ToggleChipXss = Xss<Margin>;

export interface ToggleChipProps<X> {
  text: string;
  onClick: () => void;
  xss?: X;
  disabled?: boolean;
  icon?: IconKey;
  clearable?: boolean;
  active?: boolean;
}

export function ToggleChip<X extends Only<ToggleChipXss, X>>(props: ToggleChipProps<X>) {
  const { text, onClick, xss = {}, disabled = false, icon, clearable = true, active = false } = props;
  const { fieldProps } = usePresentationContext();
  const { hoverProps, isHovered } = useHover({});

  // If compact, then use a smaller type scale
  const compact = fieldProps?.compact;
  const tid = useTestIds(props, "chip");
  return (
    <button
      type="button"
      css={{
        ...chipBaseStyles(compact),
        ...(isHovered && !disabled && hoverStyles),
        ...(active && activeStyles),
        // Use a lower right-padding to get closer to the `X` circle when clearable
        ...(clearable && Css.prPx(4).$),
        ...(disabled && disabledStyles),
        ...xss,
      }}
      disabled={disabled}
      onClick={onClick}
      {...hoverProps}
      {...tid}
    >
      {icon && (
        <span css={Css.fs0.$} {...tid.icon}>
          <Icon icon={icon} color={Palette.Gray900} inc={2} />
        </span>
      )}
      <span css={Css.tal.lineClamp1.wbba.if(disabled).pr0.$} title={text}>
        {text}
      </span>
      {!disabled && clearable && (
        <span css={{ ...Css.fs0.br16.bgGray100.$, ...(isHovered && !disabled && hoverStyles) }} {...tid.x}>
          <Icon icon="x" color={Palette.Gray600} inc={2} />
        </span>
      )}
    </button>
  );
}

const hoverStyles = Css.bgGray200.$;
const disabledStyles = Css.gray600.cursorNotAllowed.pr1.$;
const activeStyles = Css.bgBlue600.white.$;
