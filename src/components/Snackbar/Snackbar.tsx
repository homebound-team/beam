import { SnackbarNotice, SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";

type SnackbarProps = {
  notices: SnackbarNoticeProps[];
  offset: Offset;
};

export function Snackbar({ notices, offset }: SnackbarProps) {
  const tid = useTestIds({});
  return (
    <div
      {...tid.snackbarWrapper}
      css={
        Css.fixed
          .z(zIndices.snackbar)
          .bottomPx(offset.bottom ?? defaultOffset.bottom)
          .left3.df.fdc.aifs.gapPx(12).$
      }
    >
      {notices.map((data) => (
        <SnackbarNotice key={data.id} {...data} />
      ))}
    </div>
  );
}

export type Offset = {
  bottom?: number;
};

const defaultOffset: Required<Offset> = {
  bottom: 24,
};
