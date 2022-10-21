import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Css } from "../../Css";
import { AlertBanner } from "./AlertBanner";

export default {
  component: AlertBanner,
  title: "Design QA/AlertBanner",
  parameters: {
    layout: "fullscreen",
  },
} as Meta;

export function AlertBannerVariants() {
  return (
    <div css={Css.mb1.$}>
      <AlertBanner
        notices={[
          {
            type: "success",
            message:
              "This is a success message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
            onClose: action("close"),
          },
        ]}
      />
      <AlertBanner
        notices={[
          {
            type: "info",
            message:
              "This is an info message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
            onClose: action("close"),
          },
        ]}
      />
      <AlertBanner
        notices={[
          {
            type: "warning",
            message:
              "This is a warning message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
            onClose: action("close"),
          },
        ]}
      />
      <AlertBanner
        notices={[
          {
            type: "error",
            message:
              "This is an error message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
            onClose: action("close"),
          },
        ]}
      />
    </div>
  );
}
