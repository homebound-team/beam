import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { withBeamDecorator } from "src/utils/sb";
import { AlertBanner, Button } from "../index";
import { AlertBannerNoticeProps } from "./AlertBannerNotice";
import { useAlertBanner } from "./useAlertBanner";

interface AlertBannerStoryProps extends Omit<AlertBannerNoticeProps, "action"> {}

export default {
  component: AlertBanner,
  title: "Workspace/Components/AlertBanner",
  decorators: [withBeamDecorator],
} as Meta<AlertBannerStoryProps>;

export function DefaultAlertBanner(args: AlertBannerStoryProps) {
  const { ...noticeProps } = args;
  const { showAlert } = useAlertBanner();
  // immediately show the alert for Chromatic snapshots
  useEffect(
    () =>
      showAlert({
        message: "Initial notice for chromatic diff purposes to ensure proper placement.",
        onClose: action("close"),
        type: "success",
      }),
    [showAlert],
  );
  return <Button onClick={() => showAlert({ ...noticeProps })} label={"Alert"} />;
}
