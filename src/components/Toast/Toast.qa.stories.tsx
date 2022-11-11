import { Meta } from "@storybook/react";
import { Css } from "../../Css";
import { Toast } from "./Toast";

export default {
  component: Toast,
  title: "Design QA/Toast",
  parameters: {
    layout: "fullscreen",
  },
} as Meta;

export function ToastVariants() {
  return (
    <div css={Css.mb1.$}>
      <Toast />
      <Toast />
      <Toast />
      <Toast />
      <Toast />
    </div>
  );
}
