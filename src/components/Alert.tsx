import { ReactNode } from "react";
import { IconButton } from "src/components/IconButton";
import { Css, Palette } from "src/Css";

export interface AlertProps {
  children: ReactNode;
  onClose: () => void;
}

export function Alert(props: AlertProps) {
  const { children, onClose } = props;
  return (
    <div css={Css.df.itemsStart.justifyBetween.bgRed100.bRed400.red700.p2.br4.$} role="alert">
      <div>{children}</div>
      <IconButton icon="x" color={Palette.Red700} onClick={onClose} />
    </div>
  );
}
