import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { Css } from "src/Css";
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
  // return <AlertBanner type={"error"} message={"error"} />;
  return <Button onClick={() => showAlert({ ...noticeProps })} label={"Alert"} />;
}

export function AlertBannerSuccess() {
  const { showAlert } = useAlertBanner();
  const alert = () =>
    showAlert({
      type: "success",
      message:
        "This is a success message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
      onClose: action("close"),
    });
  useEffect(alert, [showAlert]);
  return (
    <div css={Css.mb1.$}>
      <Button onClick={alert} label={"Alert"} />
    </div>
  );
}

export function AlertBannerError() {
  const { showAlert } = useAlertBanner();
  const alert = () =>
    showAlert({
      type: "error",
      message:
        "This is an error message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
      onClose: action("close"),
    });
  useEffect(alert, [showAlert]);
  return (
    <div css={Css.mb1.$}>
      <Button onClick={alert} label={"Alert"} />
    </div>
  );
}

export function AlertBannerWarning() {
  const { showAlert } = useAlertBanner();
  const alert = () =>
    showAlert({
      type: "warning",
      message:
        "This is a warning message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
      onClose: action("close"),
    });
  useEffect(alert, [showAlert]);
  return (
    <div css={Css.mb1.$}>
      <Button onClick={alert} label={"Alert"} />
    </div>
  );
}

export function AlertBannerInfo() {
  const { showAlert } = useAlertBanner();
  const alert = () =>
    showAlert({
      type: "info",
      message:
        "This is an info message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
      onClose: action("close"),
    });
  useEffect(alert, [showAlert]);
  return (
    <div css={Css.mb1.$}>
      <Button onClick={alert} label={"Alert"} />
    </div>
  );
}
