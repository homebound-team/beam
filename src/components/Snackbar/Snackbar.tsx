import { createPortal } from "react-dom";
import { SnackbarNotice, type SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { Css } from "src/Css";
import { getFloatingBottomOffset } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";

type SnackbarProps = {
  notices: SnackbarNoticeProps[];
  offset: Offset;
};

export function Snackbar({ notices, offset }: SnackbarProps) {
  const tid = useTestIds({});
  // Portal to the body, like Modal and SuperDrawer, so an app root that establishes a stacking
  // context can't trap notices below the overlay scrims.
  return createPortal(
    <div
      {...tid.snackbarWrapper}
      css={
        Css.fixed
          .z(zIndices.snackbar)
          // Clears bottom-fixed chrome like the workflow mobile action footer
          .bottom(getFloatingBottomOffset(offset.bottom ?? defaultOffset.bottom))
          .left3.df.fdc.aifs.gapPx(12)
          // On mobile, notices span the full viewport width and sit flush with the bottom edge
          .ifSm.bottom(getFloatingBottomOffset(offset.bottom ?? 0))
          .left0.right0.aiStretch.gapPx(1).$
      }
    >
      {notices.map((data) => (
        <SnackbarNotice key={data.id} {...data} />
      ))}
    </div>,
    document.body,
  );
}

export type Offset = {
  bottom?: number;
};

const defaultOffset: Required<Offset> = {
  bottom: 24,
};
