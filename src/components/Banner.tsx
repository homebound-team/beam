import { ReactNode } from "react";
import { Icon, IconKey } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { Css, Palette, Properties } from "src/Css";
import { useTestIds } from "src/utils";

export interface BannerProps {
  type: BannerTypes;
  message: ReactNode;
  onClose?: VoidFunction;
}

export function Banner(props: BannerProps) {
  const { type, message, onClose = false, ...others } = props;
  const tid = useTestIds(others, "banner");
  return (
    <div css={{ ...variantStyles[type], ...Css.df.aic.w100.gap1.p2.gray900.base.bshBasic.$ }} {...tid} role="alert">
      <span css={Css.fs0.$}>
        <Icon icon={typeToIcon[type]} {...tid.type} color={Palette.Gray900} />
      </span>
      <span css={Css.fg1.$} {...tid.message}>
        {message}
      </span>
      {onClose && (
        <span css={Css.lh(0).$}>
          <IconButton icon="x" onClick={onClose} {...tid.close} color={Palette.Gray900} />
        </span>
      )}
    </div>
  );
}
const typeToIcon: Record<BannerTypes, IconKey> = {
  success: "checkCircle",
  info: "infoCircle",
  warning: "error",
  alert: "errorCircle",
  error: "xCircle",
};

const variantStyles: Record<BannerTypes, Properties> = {
  success: Css.bgGreen100.gray900.$,
  info: Css.bgBlue100.gray900.$,
  warning: Css.bgYellow200.gray900.$,
  alert: Css.bgGray200.gray900.$,
  error: Css.bgRed100.gray900.$,
};

export type BannerTypes = "error" | "warning" | "success" | "info" | "alert";
