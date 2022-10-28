import { action } from "@storybook/addon-actions";
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
      <Toast
        notice={{
          type: "success",
          message:
            "This is a success message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
          onClose: action("close"),
        }}
      />
      <Toast
        notice={{
          type: "info",
          message:
            "This is an info message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
          onClose: action("close"),
        }}
      />
      <Toast
        notice={{
          type: "warning",
          message:
            "This is a warning message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
          onClose: action("close"),
        }}
      />
      <Toast
        notice={{
          type: "alert",
          message:
            "This is an alert message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
          onClose: action("close"),
        }}
      />
      <Toast
        notice={{
          type: "error",
          message:
            "This is an error message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
          onClose: action("close"),
        }}
      />
    </div>
  );
}
