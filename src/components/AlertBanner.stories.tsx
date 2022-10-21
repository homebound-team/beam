import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { AlertBanner, Button } from "src/components";
import { Css } from "../Css";
import { noop } from "../utils";
import { withBeamDecorator } from "../utils/sb";
import { useAlertBanner } from "./useAlertBanner";

export default {
  component: AlertBanner,
  title: "Workspace/Components/AlertBanner",
  decorators: [withBeamDecorator],
} as Meta;

export function DefaultAlertBanner() {
  const { showAlert } = useAlertBanner();
  const alert = () => showAlert({ type: "error", message: "error" });
  useEffect(() => alert, [showAlert]);
  // return <AlertBanner type={"error"} message={"error"} />;
  return <Button onClick={alert} label={"Alert"} />;

  // immediately show the alert for Chromatic snapshots
  // return <AlertBanner type={"error"} message={"error"} />;
  // return (
  //   <div css={Css.df.fdc.gap3.$}>
  //     <AlertBanner onClose={action("close")}>
  //       <span css={Css.b.$}>Holy Smokes!</span>
  //       &nbsp;
  //       <span>Something seriously bad happened.</span>
  //     </AlertBanner>
  //     {/* An example with an error message that wraps. */}
  //     <AlertBanner onClose={action("close")}>
  //       <div css={Css.b.$}>Holy Smokes!</div>
  //       <div>Something seriously bad happened.</div>
  //     </AlertBanner>
  //     <AlertBanner onClose={action("close")}>Something seriously bad happened.</AlertBanner>
  //   </div>
  // );
}

export function AlertBannerSuccess() {
  const { showAlert } = useAlertBanner();
  const alert = () =>
    showAlert({
      type: "success",
      message:
        "This is a success message. The banner spans the entire width of the window/navbar and should fit on one line, but could span to two.",
      onClose: noop,
    });
  useEffect(alert, [showAlert]);
  return (
    <div css={Css.mb1.$}>
      <Button onClick={alert} label={"Alert"} />
    </div>
  );
}
