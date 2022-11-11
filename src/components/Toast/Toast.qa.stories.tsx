import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { withBeamDecorator } from "src/utils/sb";
import { Button } from "../Button";
import { Toast } from "./Toast";
import { useToast } from "./useToast";

export default {
  component: Toast,
  title: "Design QA/Toast",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withBeamDecorator],
} as Meta;

export function SuccessToast() {
  const { showToast } = useToast();
  useEffect(
    () =>
      showToast({
        message: "This is a success toast",
        type: "success",
      }),
    [showToast],
  );
  return <Button onClick={() => showToast({ message: "This is a success toast", type: "success" })} label={"Toast"} />;
}

export function ErrorToast() {
  const { showToast } = useToast();
  useEffect(
    () =>
      showToast({
        message: "This is an error toast",
        type: "error",
      }),
    [showToast],
  );
  return <Button onClick={() => showToast({ message: "This is an error toast", type: "error" })} label={"Toast"} />;
}

export function WarningToast() {
  const { showToast } = useToast();
  useEffect(
    () =>
      showToast({
        message: "This is a warning toast",
        type: "warning",
      }),
    [showToast],
  );
  return <Button onClick={() => showToast({ message: "This is a warning toast", type: "warning" })} label={"Toast"} />;
}

export function InfoToast() {
  const { showToast } = useToast();
  useEffect(
    () =>
      showToast({
        message: "This is an info toast",
        type: "info",
      }),
    [showToast],
  );
  return <Button onClick={() => showToast({ message: "This is an info toast", type: "info" })} label={"Toast"} />;
}

export function AlertToast() {
  const { showToast } = useToast();
  useEffect(
    () =>
      showToast({
        message: "This is an alert toast",
        type: "alert",
      }),
    [showToast],
  );
  return <Button onClick={() => showToast({ message: "This is an alert toast", type: "alert" })} label={"Toast"} />;
}
