import { SnackbarNotice, SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { Css } from "src/Css";

interface SnackbarProps {
  notices: SnackbarNoticeProps[];
  bottomOffset?: number;
}

export function Snackbar({ bottomOffset = 24, notices }: SnackbarProps) {
  return (
    <div css={Css.fixed.z999.bottomPx(bottomOffset).left3.df.fdc.aifs.gapPx(12).$}>
      {notices.map((data) => (
        <SnackbarNotice key={data.id} {...data} />
      ))}
    </div>
  );
}
