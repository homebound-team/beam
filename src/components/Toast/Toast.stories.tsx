import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { withBeamDecorator } from "src/utils/sb";
import { Button } from "../index";
import { Toast } from "./Toast";
import { ToastNoticeProps } from "./ToastContext";
import { useToast } from "./useToast";

interface ToastStoryProps extends Omit<ToastNoticeProps, "action"> {}

export default {
  component: Toast,
  title: "Workspace/Components/Toast",
  decorators: [withBeamDecorator],
  args: {
    message: "This is a success message",
    type: "success",
  },
} as Meta<ToastStoryProps>;

export function DefaultToast(args: ToastStoryProps) {
  const { message, type } = args;
  const { showToast } = useToast();
  // immediately show the toast for Chromatic snapshots
  useEffect(
    () =>
      showToast({
        message: "Initial notice for chromatic diff purposes to ensure proper placement.",
        type: "success",
      }),
    [showToast],
  );
  return <Button onClick={() => showToast({ message, type })} label={"Toast"} />;
}

export function ToastStory(args: ToastStoryProps) {
  const { ...noticeProps } = args;
  const { showToast } = useToast();
  return <Button onClick={() => showToast({ ...noticeProps })} label={"Toast"} />;
}
