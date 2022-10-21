import { Css, Palette } from "src/Css";
import { useBeamContext } from "./BeamContext";
import { IconButton } from "./IconButton";

export type AlertBannerVariant = "success" | "info" | "warning" | "error";

export interface AlertBannerProps {
  type: AlertBannerVariant;
  message: string;
  onClose: () => void;
}

export function AlertBanner(props: AlertBannerProps) {
  const { onClose } = props;
  const { alertBannerState } = useBeamContext();
  console.log(alertBannerState.current);
  console.log("this is not working!!");
  if (!alertBannerState.current) {
    return null;
  }

  const { type, message } = alertBannerState.current;

  return (
    <div css={variantStyles[type]} role="alert">
      <IconButton icon="checkCircle" color={Palette.White} onClick={onClose} />
      <div>{message}</div>
      <IconButton icon="x" color={Palette.White} onClick={onClose} />
    </div>
  );
}
// {Css.df.aifs.jcsb.bgRed100.ba.bRed400.red700.p2.br4.$}
const variantStyles: Record<AlertBannerVariant, {}> = {
  success: Css.df.aic.jcsb.bgGreen600.white.pPx(12).$,
  info: Css.bgWhite.$,
  warning: Css.bgYellow600.$,
  error: Css.bgRed600.$,
};
