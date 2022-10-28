import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { withBeamDecorator } from "src/utils/sb";
import { Button, Toast } from "../index";
import { ToastNoticeProps } from "./ToastNotice";
import { useToast } from "./useToast";

interface ToastStoryProps extends Omit<ToastNoticeProps, "action"> {}

export default {
  component: Toast,
  title: "Workspace/Components/Toast",
  decorators: [withBeamDecorator],
} as Meta<ToastStoryProps>;

export function DefaultToast(args: ToastStoryProps) {
  const { ...noticeProps } = args;
  const { showToast } = useToast();
  // immediately show the toast for Chromatic snapshots
  useEffect(
    () =>
      showToast({
        message: "Initial notice for chromatic diff purposes to ensure proper placement.",
        onClose: action("close"),
        type: "success",
      }),
    [showToast],
  );
  return <Button onClick={() => showToast({ ...noticeProps })} label={"Toast"} />;
}
