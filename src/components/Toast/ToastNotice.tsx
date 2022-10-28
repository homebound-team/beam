import { ReactNode } from "react";
import { Icon, IconKey } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";

export type ToastNoticeTypes = "error" | "warning" | "success" | "info" | "alert";
export interface ToastNoticeProps {
  type: ToastNoticeTypes;
  message: ReactNode;
  /** Removes the snackbar notice from the stack */
  onClose: () => void;
}

export function ToastNotice(props: ToastNoticeProps) {
  const { message, type, onClose } = props;
  const tid = useTestIds(props, "toast");

  return (
    <div css={{ ...variantStyles[type], ...Css.df.aic.w100.gap2.px2.py2.$ }} {...tid} role="alert">
      <span css={Css.fs0.plPx(12).$}>
        <Icon icon={typeToIcon[type]} {...tid.type} color={Palette.Gray900} />
      </span>
      <span {...tid.message}>{message}</span>
      <span css={Css.pr1.add("lineHeight", 0).add("marginLeft", "auto").$}>
        <IconButton icon="x" contrast onClick={onClose} {...tid.close} color={Palette.Gray900} />
      </span>
    </div>
  );
}

const typeToIcon: Record<ToastNoticeTypes, IconKey> = {
  success: "checkCircle",
  info: "infoCircle",
  warning: "error",
  alert: "errorCircle",
  error: "xCircle",
};

const variantStyles: Record<ToastNoticeTypes, {}> = {
  success: Css.bgGreen100.gray900.$,
  info: Css.bgLightBlue100.gray900.$,
  warning: Css.bgYellow200.gray900.$,
  alert: Css.bgGray200.gray900.$,
  error: Css.bgRed100.gray900.$,
};
