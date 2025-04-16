import { ReactNode, useMemo } from "react";
import { Icon, IconKey } from "src/components/Icon";
import { usePresentationContext } from "src/components/PresentationContext";
import { maybeTooltip } from "src/components/Tooltip";
import { Css, Margin, Only, Properties, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type ChipType = "caution" | "warning" | "success" | "light" | "dark" | "neutral" | "darkMode" | "info";

// exporting for using in type prop as constant - this could be moved and become a global list for colors
export const ChipTypes: Record<ChipType, ChipType> = {
  caution: "caution",
  warning: "warning",
  success: "success",
  light: "light",
  dark: "dark",
  neutral: "neutral",
  darkMode: "darkMode",
  info: "info",
};

export interface ChipProps<X> {
  text: ReactNode;
  title?: ReactNode;
  xss?: X;
  // Defaults to "neutral"
  type?: ChipType;
  compact?: boolean;
  icon?: IconKey;
}

/** Kinda like a chip, but read-only, so no `onClick` or `hover`. */
export function Chip<X extends Only<Xss<Margin | "color" | "backgroundColor">, X>>(props: ChipProps<X>) {
  const { fieldProps } = usePresentationContext();
  const { text, title, xss = {}, compact = fieldProps?.compact, icon, type = ChipTypes.neutral } = props;
  const tid = useTestIds(props, "chip");

  const styles = useMemo(
    () => ({
      ...chipBaseStyles(compact),
      ...typeStyles[type],
      ...xss,
    }),
    [type, xss, compact],
  );

  return maybeTooltip({
    title,
    placement: "bottom",
    children: (
      <span css={styles} {...tid}>
        {icon && <Icon icon={icon} inc={2} xss={Css.fs0.$} />}
        <span css={Css.lineClamp1.wbba.$}>{text}</span>
      </span>
    ),
  });
}

const typeStyles: Record<ChipType, Properties> = {
  caution: Css.bgYellow200.$,
  warning: Css.bgRed100.$,
  success: Css.bgGreen100.$,
  light: Css.bgWhite.$,
  dark: Css.bgGray900.white.$,
  neutral: Css.bgGray100.$,
  darkMode: Css.bgGray700.white.$,
  info: Css.bgBlue100.$,
};

export const chipBaseStyles = (compact?: boolean) =>
  Css.xsMd.dif.aic.br16.px1.gapPx(4).pyPx(pyHeight(compact)).mhPx(minhPx(compact)).gray900.bgGray100.$;

const pyHeight = (compact?: boolean) => (compact ? 2 : 4);
const minhPx = (compact?: boolean) => (compact ? 20 : 24);
