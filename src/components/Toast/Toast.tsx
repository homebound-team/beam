import { Icon, IconKey } from "src/components/Icon";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";
import { IconButton } from "../IconButton";
import { useToast } from "./useToast";

export type ToastTypes = "error" | "warning" | "success" | "info" | "alert";

export function Toast() {
  // using toast context to set notice to undefined once the user clicks out of the alert
  const { notice, setNotice } = useToast();
  const tid = useTestIds(props, "toast");
// conditionally render based on notice being set
  return (
      {notice && <div css={{ ...variantStyles[type], ...Css.df.aic.w100.gap2.px2.py2.$ }} {...tid} role="alert">
      <span css={Css.fs0.$}>
        <Icon icon={typeToIcon[type]} {...tid.type} color={Palette.Gray900} />
      </span>
          <span css={Css.fg1.$} {...tid.message}>
        {message}
      </span>
          <span css={Css.lh(0).$}>
        <IconButton icon="x" onClick={() => setNotice(undefined)} {...tid.close} color={Palette.Gray900} />
      </span>
      </div>}

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
