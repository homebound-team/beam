import { SnackbarNotice, SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { Css } from "src/Css";

interface SnackbarProps {
  notices: SnackbarNoticeProps[];
}

export function Snackbar({ notices }: SnackbarProps) {
  return (
    <div css={Css.fixed.bottom3.left3.df.fdc.aifs.gapPx(12).$}>
      {notices.map((data) => (
        <SnackbarNotice key={data.id} {...data} />
      ))}
    </div>
  );
}
