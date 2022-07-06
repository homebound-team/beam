import { SnackbarNotice, SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { Css } from "src/Css";

interface SnackbarProps {
  notices: SnackbarNoticeProps[];
  offset: Offset;
}

export function Snackbar({ notices, offset }: SnackbarProps) {
  return (
    <div css={Css.fixed.bottomPx(offset.bottom ?? 24).left3.df.fdc.aifs.gapPx(12).$}>
      {notices.map((data) => (
        <SnackbarNotice key={data.id} {...data} />
      ))}
    </div>
  );
}

export type Offset = {
  bottom?: number;
};
