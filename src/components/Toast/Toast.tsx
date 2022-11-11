import { Icon, IconKey } from "src/components/Icon";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";
import { IconButton } from "../IconButton";
import { useToastContext } from "./ToastContext";

export type ToastTypes = "error" | "warning" | "success" | "info" | "alert";

export function Toast() {
  const { setNotice, notice } = useToastContext();
  const tid = useTestIds({}, "toast");
  return (
    <>
      {notice && (
        <div css={{ ...variantStyles[notice.type], ...Css.df.aic.w100.gap2.px2.py2.$ }} {...tid} role="alert">
          <span css={Css.fs0.$}>
            <Icon icon={typeToIcon[notice.type]} {...tid.type} color={Palette.Gray900} />
          </span>
          <span css={Css.fg1.$} {...tid.message}>
            {notice.message}
          </span>
          <span css={Css.lh(0).$}>
            <IconButton icon="x" onClick={() => setNotice(undefined)} {...tid.close} color={Palette.Gray900} />
          </span>
        </div>
      )}
    </>
  );
}

const typeToIcon: Record<ToastTypes, IconKey> = {
  success: "checkCircle",
  info: "infoCircle",
  warning: "error",
  alert: "errorCircle",
  error: "xCircle",
};

const variantStyles: Record<ToastTypes, {}> = {
  success: Css.bgGreen100.gray900.$,
  info: Css.bgLightBlue100.gray900.$,
  warning: Css.bgYellow200.gray900.$,
  alert: Css.bgGray200.gray900.$,
  error: Css.bgRed100.gray900.$,
};
