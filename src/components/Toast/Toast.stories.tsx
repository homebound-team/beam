import { Meta } from "@storybook/react";
import { useEffect, useState } from "react";
import { withBeamDecorator } from "src/utils/sb";
import { Button, Toast, ToastProps } from "../index";
import { useToast } from "./useToast";

interface ToastStoryProps extends Omit<ToastProps, "action"> {}

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
  const { ...noticeProps } = args;
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
  return <Button onClick={() => showToast({ ...noticeProps })} label={"Toast"} />;
}

export function ToastStory(args: ToastStoryProps) {
  const [show, setShow] = useState(true);
  const { ...noticeProps } = args;
  const { showToast } = useToast();
  return <Button onClick={() => showToast({ ...noticeProps })} label={"Toast"} />;
}
