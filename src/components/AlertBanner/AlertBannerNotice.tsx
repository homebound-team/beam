import { ReactNode } from "react";
import { Icon, IconKey } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type AlertBannerNoticeTypes = "error" | "warning" | "success" | "info";
export interface AlertBannerNoticeProps {
  /** Adds action button to the right of the notice */
  type: AlertBannerNoticeTypes;
  message: ReactNode;
  /** Removes the snackbar notice from the stack */
  onClose: () => void;
}

export function AlertBannerNotice(props: AlertBannerNoticeProps) {
  const { message, type, onClose } = props;
  const tid = useTestIds(props, "alertBanner");

  return (
    <div css={{ ...variantStyles[type], ...Css.df.aic.jcsb.pPx(12).$ }} {...tid} role="alert">
      <span css={Css.fs0.plPx(12).$}>
        <Icon icon={typeToIcon[type]} {...tid.type} />
      </span>
      <span {...tid.message}>{message}</span>
      <span css={Css.pr1.add("lineHeight", 0).$}>
        <IconButton icon="x" contrast onClick={onClose} {...tid.close} />
      </span>
    </div>
  );
}

const typeToIcon: Record<AlertBannerNoticeTypes, IconKey> = {
  error: "xCircle",
  warning: "error",
  success: "checkCircle",
  info: "infoCircle",
};

const variantStyles: Record<AlertBannerNoticeTypes, {}> = {
  success: Css.bgGreen600.white.$,
  info: Css.bgWhite.$,
  warning: Css.bgYellow600.white.$,
  error: Css.bgRed600.white.$,
};
