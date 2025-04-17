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
}

export function ToggleChip<X extends Only<ToggleChipXss, X>>(props: ToggleChipProps<X>) {
  const { text, onClick, xss = {}, disabled = false, icon } = props;
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
        ...(isHovered && !disabled && chipHoverStyles),
        // Use a lower right-padding to get closer to the `X` circle when clearable, i.e. not disabled
        ...(!disabled && Css.prPx(4).$),
        ...(disabled && { ...chipDisabledStyles, ...Css.pr1.$ }),
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
      {/* x icon is not displayed when chip is disabled */}
      {!disabled && (
        <span css={{ ...Css.fs0.br16.bgGray100.$, ...(isHovered && chipHoverStyles) }} {...tid.x}>
          <Icon icon="x" color={Palette.Gray600} inc={2} />
        </span>
      )}
    </button>
  );
}

export const chipHoverStyles = Css.bgGray200.$;
export const chipDisabledStyles = Css.gray600.cursorNotAllowed.$;
